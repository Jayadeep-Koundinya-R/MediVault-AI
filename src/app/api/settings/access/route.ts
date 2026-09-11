import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPgPool();

    // 1. Trusted Doctors with permissions and last access timestamp
    const docRes = await pool.query(
      `SELECT 
        r.id as "relationshipId",
        r.doctor_id as "doctorId",
        r.status,
        dp.full_name as "doctorName",
        dp.specialization,
        dp.clinic_name as "clinicName",
        dp.verification_status = 'verified' as "isVerified",
        dap.share_summary as "shareSummary",
        dap.share_labs as "shareLabs",
        dap.share_prescriptions as "sharePrescriptions",
        dap.share_vaccinations as "shareVaccinations",
        dap.share_original_documents as "shareOriginalDocuments",
        (
          SELECT MAX(al.created_at) 
          FROM access_logs al 
          WHERE al.patient_user_id = $1 AND al.actor_user_id = r.doctor_id
        ) as "lastAccessedAt"
      FROM doctor_patient_relationships r
      JOIN doctor_profiles dp ON dp.user_id = r.doctor_id
      LEFT JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
      WHERE r.patient_id = $1 AND r.status != 'declined'
      ORDER BY r.created_at DESC;`,
      [user.id]
    );

    // 2. Family Members with permissions
    const famRes = await pool.query(
      `SELECT 
        fr.id as "relationshipId",
        fr.member_name as "memberName",
        fr.relationship_type as "relationshipType",
        fr.status,
        fap.share_summary as "shareSummary",
        fap.share_labs as "shareLabs",
        fap.share_prescriptions as "sharePrescriptions",
        fap.share_vaccinations as "shareVaccinations",
        fap.share_flags as "shareFlags",
        (
          SELECT MAX(al.created_at) 
          FROM access_logs al 
          WHERE al.patient_user_id = $1 AND al.actor_user_id = fr.member_user_id
        ) as "lastAccessedAt"
      FROM family_relationships fr
      LEFT JOIN family_access_permissions fap ON fap.family_relationship_id = fr.id
      WHERE fr.owner_user_id = $1 AND fr.status != 'revoked'
      ORDER BY fr.created_at DESC;`,
      [user.id]
    );

    // 3. Access logs for audit trail
    const logsRes = await pool.query(
      `SELECT 
        al.id,
        al.actor_user_id as "actorUserId",
        al.action,
        al.resource_type as "resourceType",
        al.resource_id as "resourceId",
        al.created_at as "createdAt",
        COALESCE(dp.full_name, p.full_name, 'System') as "actorName"
      FROM access_logs al
      LEFT JOIN doctor_profiles dp ON dp.user_id = al.actor_user_id
      LEFT JOIN profiles p ON p.id = al.actor_user_id
      WHERE al.patient_user_id = $1
      ORDER BY al.created_at DESC
      LIMIT 20;`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      trustedDoctors: docRes.rows,
      familyMembers: famRes.rows,
      logs: logsRes.rows,
      accessLogs: logsRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching access management data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch access management data' },
      { status: 500 }
    );
  }
}
