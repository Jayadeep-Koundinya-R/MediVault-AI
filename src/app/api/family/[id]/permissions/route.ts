import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let familyId = context.params?.id;
  if (!familyId) {
    const segments = new URL(request.url).pathname.split('/');
    const pIdx = segments.indexOf('permissions');
    familyId = pIdx > 0 ? segments[pIdx - 1] : segments[segments.length - 1];
  }

  try {
    const pool = getPgPool();
    const res = await pool.query(
      `SELECT fap.*
       FROM family_access_permissions fap
       JOIN family_relationships fr ON fr.id = fap.family_relationship_id
       WHERE fr.id = $1 AND (fr.owner_user_id = $2 OR fr.member_user_id = $2);`,
      [familyId, user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Permissions not found' }, { status: 404 });
    }

    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      permissions: {
        id: row.id,
        familyRelationshipId: row.family_relationship_id,
        shareSummary: row.share_summary,
        shareLabs: row.share_labs,
        sharePrescriptions: row.share_prescriptions,
        shareVaccinations: row.share_vaccinations,
        shareFlags: row.share_flags,
      },
    });
  } catch (err: any) {
    console.error('Error fetching family permissions:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch permissions' },
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
    const pIdx = segments.indexOf('permissions');
    familyId = pIdx > 0 ? segments[pIdx - 1] : segments[segments.length - 1];
  }

  try {
    const body = await request.json();
    const { shareSummary, shareLabs, sharePrescriptions, shareVaccinations, shareFlags } = body;

    const pool = getPgPool();

    // Verify user is the member or owner
    const relRes = await pool.query(
      `SELECT id, owner_user_id, member_user_id FROM family_relationships WHERE id = $1;`,
      [familyId]
    );

    if (relRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Family relationship not found' }, { status: 404 });
    }

    const rel = relRes.rows[0];
    if (rel.owner_user_id !== user.id && rel.member_user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized to change permissions' }, { status: 403 });
    }

    const res = await pool.query(
      `INSERT INTO family_access_permissions (
        family_relationship_id, share_summary, share_labs, share_prescriptions, share_vaccinations, share_flags, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (family_relationship_id) DO UPDATE SET
        share_summary = EXCLUDED.share_summary,
        share_labs = EXCLUDED.share_labs,
        share_prescriptions = EXCLUDED.share_prescriptions,
        share_vaccinations = EXCLUDED.share_vaccinations,
        share_flags = EXCLUDED.share_flags,
        updated_at = now()
      RETURNING *;`,
      [
        familyId,
        shareSummary ?? false,
        shareLabs ?? false,
        sharePrescriptions ?? false,
        shareVaccinations ?? false,
        shareFlags ?? false,
      ]
    );

    return NextResponse.json({
      success: true,
      permissions: res.rows[0],
      message: 'Family sharing permissions updated.',
    });
  } catch (err: any) {
    console.error('Error updating family permissions:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
