import { NextResponse } from 'next/server';
import { getAuthenticatedDoctor, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, doctorProfile, error } = await getAuthenticatedDoctor(request);
  if (!user || !doctorProfile) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'all'; // 'all' | 'needs_review' | 'reviewed'

  try {
    const pool = getPgPool();

    // Query summaries belonging to accepted patients who share summaries
    let query = `
      SELECT 
        s.id as "summaryId",
        s.user_id as "patientId",
        s.generated_at as "generatedAt",
        s.summary_text as "summaryText",
        s.trend_notes as "trendNotes",
        p.full_name as "patientName",
        p.email as "patientEmail",
        (
          SELECT json_build_object(
            'id', dr.id,
            'reviewText', dr.review_text,
            'reviewedAt', dr.reviewed_at,
            'status', dr.status
          )
          FROM doctor_reviews dr 
          WHERE dr.summary_id = s.id AND dr.doctor_id = $1
          LIMIT 1
        ) as "doctorReview",
        (
          SELECT COUNT(*)::int 
          FROM risk_flags rf 
          WHERE rf.user_id = s.user_id
        ) as "flagsCount"
      FROM summaries s
      JOIN doctor_patient_relationships r ON r.patient_id = s.user_id
      JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
      JOIN profiles p ON p.id = s.user_id
      WHERE r.doctor_id = $1 
      AND r.status = 'accepted'
      AND dap.share_summary = true
    `;

    if (tab === 'needs_review') {
      query += ` AND NOT EXISTS (SELECT 1 FROM doctor_reviews dr WHERE dr.summary_id = s.id AND dr.doctor_id = $1)`;
    } else if (tab === 'reviewed') {
      query += ` AND EXISTS (SELECT 1 FROM doctor_reviews dr WHERE dr.summary_id = s.id AND dr.doctor_id = $1)`;
    }

    query += ` ORDER BY s.generated_at DESC;`;

    const res = await pool.query(query, [user.id]);
    return NextResponse.json({
      success: true,
      reports: res.rows.map((r) => ({
        ...r,
        isReviewed: Boolean(r.doctorReview),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching doctor reports:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
