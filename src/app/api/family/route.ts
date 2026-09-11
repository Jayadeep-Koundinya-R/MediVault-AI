import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPgPool();

    // Fetch relationships where user is owner or member
    const res = await pool.query(
      `SELECT 
        fr.id,
        fr.owner_user_id as "ownerUserId",
        fr.member_user_id as "memberUserId",
        fr.member_name as "memberName",
        fr.relationship_type as "relationshipType",
        fr.status,
        fr.created_at as "createdAt",
        fr.accepted_at as "acceptedAt",
        fr.revoked_at as "revokedAt",
        json_build_object(
          'id', fap.id,
          'shareSummary', fap.share_summary,
          'shareLabs', fap.share_labs,
          'sharePrescriptions', fap.share_prescriptions,
          'shareVaccinations', fap.share_vaccinations,
          'shareFlags', fap.share_flags
        ) as "permissions",
        (
          SELECT COUNT(*)::int 
          FROM documents d 
          WHERE d.user_id = fr.member_user_id
        ) as "sharedRecordsCount",
        (
          SELECT COUNT(*)::int 
          FROM risk_flags rf 
          WHERE rf.user_id = fr.member_user_id
        ) as "sharedFlagsCount",
        (
          SELECT s.generated_at 
          FROM summaries s 
          WHERE s.user_id = fr.member_user_id 
          ORDER BY s.generated_at DESC 
          LIMIT 1
        ) as "lastUpdateDate"
      FROM family_relationships fr
      LEFT JOIN family_access_permissions fap ON fap.family_relationship_id = fr.id
      WHERE (fr.owner_user_id = $1 OR fr.member_user_id = $1)
      AND fr.status != 'revoked'
      ORDER BY fr.created_at DESC;`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      familyMembers: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching family relationships:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = (body.name || body.memberName || '').trim();
    const { relationshipType, email } = body;

    if (!name && !email?.trim()) {
      return NextResponse.json({ success: false, error: 'Name or email is required' }, { status: 400 });
    }

    const pool = getPgPool();

    let memberUserId: string | null = null;
    let memberName = name?.trim() || '';
    let status = 'pending';

    // If an email was provided, search for existing user
    if (email) {
      const uRes = await pool.query(`SELECT id, full_name FROM profiles WHERE email = $1`, [email.trim().toLowerCase()]);
      if (uRes.rows.length > 0) {
        memberUserId = uRes.rows[0].id;
        memberName = memberName || uRes.rows[0].full_name;
      }
    }

    // If creating a family profile without an account, default to accepted
    if (!memberUserId && !email) {
      status = 'accepted';
    }

    // Prevent duplicate relationship
    if (memberUserId) {
      const dup = await pool.query(
        `SELECT id FROM family_relationships 
         WHERE owner_user_id = $1 AND member_user_id = $2 AND status != 'revoked'`,
        [user.id, memberUserId]
      );
      if (dup.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'This user is already connected as a family member.' }, { status: 409 });
      }
    }

    const insRes = await pool.query(
      `INSERT INTO family_relationships (owner_user_id, member_user_id, member_name, relationship_type, status, accepted_at)
       VALUES ($1, $2, $3, $4, $5, ${status === 'accepted' ? 'now()' : 'NULL'})
       RETURNING *;`,
      [user.id, memberUserId, memberName || 'Family Member', relationshipType || 'Family', status]
    );

    const rel = insRes.rows[0];

    // If existing member user, send notification
    if (memberUserId) {
      const ownerProf = await pool.query(`SELECT full_name FROM profiles WHERE id = $1`, [user.id]);
      const ownerName = ownerProf.rows[0]?.full_name || 'A family member';

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, related_id)
         VALUES ($1, 'family_request', 'Family Connection Request', $2, $3);`,
        [memberUserId, `${ownerName} wants to connect you as a family member.`, rel.id]
      );
    }

    return NextResponse.json({
      success: true,
      relationship: rel,
      message: status === 'accepted' ? 'Family profile created.' : 'Family invitation sent.',
    });
  } catch (err: any) {
    console.error('Error adding family member:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add family member' },
      { status: 500 }
    );
  }
}
