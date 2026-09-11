import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let familyId = context.params?.id;
  if (!familyId) {
    const segments = new URL(request.url).pathname.split('/');
    familyId = segments[segments.length - 1] === '' ? segments[segments.length - 2] : segments[segments.length - 1];
  }

  try {
    const pool = getPgPool();

    // Fetch relationship and permissions
    const relRes = await pool.query(
      `SELECT 
        fr.*,
        fap.share_summary as "shareSummary",
        fap.share_labs as "shareLabs",
        fap.share_prescriptions as "sharePrescriptions",
        fap.share_vaccinations as "shareVaccinations",
        fap.share_flags as "shareFlags"
       FROM family_relationships fr
       LEFT JOIN family_access_permissions fap ON fap.family_relationship_id = fr.id
       WHERE fr.id = $1 AND (fr.owner_user_id = $2 OR fr.member_user_id = $2);`,
      [familyId, user.id]
    );

    if (relRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Family relationship not found' }, { status: 404 });
    }

    const rel = relRes.rows[0];
    if (rel.status !== 'accepted') {
      return NextResponse.json({
        success: true,
        relationship: rel,
        data: { summaries: [], labResults: [], riskFlags: [], prescriptions: [], vaccinations: [] },
      });
    }

    // Determine target user ID (the family member whose data is being viewed)
    const targetUserId = rel.member_user_id || rel.owner_user_id;

    let summaries: any[] = [];
    let labResults: any[] = [];
    let riskFlags: any[] = [];
    let prescriptions: any[] = [];
    let vaccinations: any[] = [];

    if (rel.shareSummary && targetUserId) {
      const sumRes = await pool.query(
        `SELECT id, user_id as "userId", generated_at as "generatedAt", summary_text as "summaryText", trend_notes as "trendNotes"
         FROM summaries WHERE user_id = $1 ORDER BY generated_at DESC;`,
        [targetUserId]
      );
      summaries = sumRes.rows;
    }

    if (rel.shareLabs && targetUserId) {
      const labsRes = await pool.query(
        `SELECT * FROM lab_results WHERE user_id = $1 ORDER BY test_date DESC;`,
        [targetUserId]
      );
      labResults = labsRes.rows;
    }

    if (rel.shareFlags && targetUserId) {
      const flagsRes = await pool.query(
        `SELECT * FROM risk_flags WHERE user_id = $1 ORDER BY flagged_at DESC;`,
        [targetUserId]
      );
      riskFlags = flagsRes.rows;
    }

    if (rel.sharePrescriptions && targetUserId) {
      const rxRes = await pool.query(
        `SELECT * FROM prescriptions WHERE user_id = $1 ORDER BY prescribed_date DESC;`,
        [targetUserId]
      );
      prescriptions = rxRes.rows;
    }

    if (rel.shareVaccinations && targetUserId) {
      const vaxRes = await pool.query(
        `SELECT * FROM vaccinations WHERE user_id = $1 ORDER BY date_administered DESC;`,
        [targetUserId]
      );
      vaccinations = vaxRes.rows;
    }

    return NextResponse.json({
      success: true,
      relationship: rel,
      permissions: {
        shareSummary: rel.shareSummary,
        shareLabs: rel.shareLabs,
        sharePrescriptions: rel.sharePrescriptions,
        shareVaccinations: rel.shareVaccinations,
        shareFlags: rel.shareFlags,
      },
      data: {
        summaries,
        labResults,
        riskFlags,
        prescriptions,
        vaccinations,
      },
    });
  } catch (err: any) {
    console.error('Error fetching family member detail:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch family member' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let familyId = context.params?.id;
  if (!familyId) {
    const segments = new URL(request.url).pathname.split('/');
    familyId = segments[segments.length - 1] === '' ? segments[segments.length - 2] : segments[segments.length - 1];
  }

  try {
    const body = await request.json();
    const { status } = body;

    const pool = getPgPool();
    const res = await pool.query(
      `UPDATE family_relationships 
       SET status = $1, accepted_at = ${status === 'accepted' ? 'now()' : 'accepted_at'}
       WHERE id = $2 AND (owner_user_id = $3 OR member_user_id = $3)
       RETURNING *;`,
      [status, familyId, user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Family relationship not found or not permitted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      relationship: res.rows[0],
    });
  } catch (err: any) {
    console.error('Error updating family relationship:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update family relationship' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let familyId = context.params?.id;
  if (!familyId) {
    const segments = new URL(request.url).pathname.split('/');
    familyId = segments[segments.length - 1] === '' ? segments[segments.length - 2] : segments[segments.length - 1];
  }

  try {
    const pool = getPgPool();
    // Revoke access immediately
    const res = await pool.query(
      `UPDATE family_relationships 
       SET status = 'revoked', revoked_at = now() 
       WHERE id = $1 AND (owner_user_id = $2 OR member_user_id = $2)
       RETURNING id;`,
      [familyId, user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Relationship not found or not permitted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Family access revoked successfully.',
    });
  } catch (err: any) {
    console.error('Error revoking family access:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to revoke family access' },
      { status: 500 }
    );
  }
}
