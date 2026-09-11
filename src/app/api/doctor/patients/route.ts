import { NextResponse } from 'next/server';
import { getAuthenticatedDoctor, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, doctorProfile, error } = await getAuthenticatedDoctor(request);
  if (!user || !doctorProfile) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 403 });
  }

  try {
    const pool = getPgPool();

    // Query all accepted patients for this doctor
    const res = await pool.query(
      `SELECT 
        r.id as "relationshipId",
        r.patient_id as "patientId",
        r.created_at as "connectedAt",
        p.full_name as "fullName",
        p.email,
        p.date_of_birth as "dateOfBirth",
        p.blood_group as "bloodGroup",
        p.phone,
        dap.share_summary as "shareSummary",
        dap.share_labs as "shareLabs",
        dap.share_prescriptions as "sharePrescriptions",
        dap.share_vaccinations as "shareVaccinations",
        dap.share_original_documents as "shareOriginalDocuments",
        (
          SELECT json_build_object(
            'id', s.id,
            'generatedAt', s.generated_at,
            'summaryText', s.summary_text
          )
          FROM summaries s 
          WHERE s.user_id = r.patient_id 
          ORDER BY s.generated_at DESC 
          LIMIT 1
        ) as "latestSummary",
        (
          SELECT COUNT(*)::int 
          FROM risk_flags rf 
          WHERE rf.user_id = r.patient_id
        ) as "flagsCount",
        (
          SELECT COUNT(*)::int 
          FROM doctor_reviews dr 
          JOIN summaries s ON s.id = dr.summary_id
          WHERE s.user_id = r.patient_id AND dr.doctor_id = $1
        ) as "reviewedCount"
      FROM doctor_patient_relationships r
      JOIN profiles p ON p.id = r.patient_id
      LEFT JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
      WHERE r.doctor_id = $1 AND r.status = 'accepted'
      ORDER BY r.created_at DESC;`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      patients: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching doctor patients:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}
