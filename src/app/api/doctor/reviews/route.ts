import { NextResponse } from 'next/server';
import { getAuthenticatedDoctor, getAuthenticatedUser, getPgPool, logAccess } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const summaryId = searchParams.get('summaryId');
  const patientId = searchParams.get('patientId') || user.id;

  try {
    const pool = getPgPool();
    let query = `
      SELECT 
        dr.id,
        dr.doctor_id as "doctorId",
        dr.patient_id as "patientId",
        dr.summary_id as "summaryId",
        dr.review_text as "reviewText",
        dr.status,
        dr.reviewed_at as "reviewedAt",
        dr.created_at as "createdAt",
        dp.full_name as "doctorName",
        dp.specialization as "doctorSpecialization",
        dp.clinic_name as "doctorClinic",
        dp.verification_status as "doctorVerificationStatus"
      FROM doctor_reviews dr
      JOIN doctor_profiles dp ON dp.user_id = dr.doctor_id
      WHERE (dr.patient_id = $1 OR dr.doctor_id = $1)
    `;
    const params: any[] = [user.id];

    if (summaryId) {
      params.push(summaryId);
      query += ` AND dr.summary_id = $${params.length}`;
    }

    query += ` ORDER BY dr.reviewed_at DESC;`;

    const res = await pool.query(query, params);
    return NextResponse.json({
      success: true,
      reviews: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching doctor reviews:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch doctor reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user, doctorProfile, error } = await getAuthenticatedDoctor(request);
  if (!user || !doctorProfile) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 403 });
  }

  // Doctor MUST be verified
  if (doctorProfile.verification_status !== 'verified') {
    return NextResponse.json(
      { success: false, error: 'Only verified doctors can submit clinical report reviews.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { summaryId, patientId, reviewText } = body;

    if (!summaryId || !patientId || !reviewText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Summary ID, Patient ID, and review text are required.' },
        { status: 400 }
      );
    }

    const pool = getPgPool();

    // Verify relationship and summary sharing permission
    const relRes = await pool.query(
      `SELECT r.id, dap.share_summary
       FROM doctor_patient_relationships r
       JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
       WHERE r.doctor_id = $1 AND r.patient_id = $2 AND r.status = 'accepted';`,
      [user.id, patientId]
    );

    if (relRes.rows.length === 0 || !relRes.rows[0].share_summary) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to review this patient report.' },
        { status: 403 }
      );
    }

    // Verify summary exists and belongs to patient
    const sumRes = await pool.query(
      `SELECT id FROM summaries WHERE id = $1 AND user_id = $2;`,
      [summaryId, patientId]
    );

    if (sumRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Health summary not found for this patient.' },
        { status: 404 }
      );
    }

    // Insert review
    const insRes = await pool.query(
      `INSERT INTO doctor_reviews (doctor_id, patient_id, summary_id, review_text, status, reviewed_at)
       VALUES ($1, $2, $3, $4, 'reviewed', now())
       RETURNING *;`,
      [user.id, patientId, summaryId, reviewText.trim()]
    );

    const review = insRes.rows[0];

    // Notify patient of doctor review
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_id)
       VALUES ($1, 'doctor_review', $2, $3, $4);`,
      [
        patientId,
        `Dr. ${doctorProfile.full_name} reviewed your health summary. ★`,
        reviewText.trim().slice(0, 120),
        summaryId,
      ]
    );

    // Audit log
    await logAccess({
      actorUserId: user.id,
      patientUserId: patientId,
      action: 'doctor_reviewed_summary',
      resourceType: 'summary',
      resourceId: summaryId,
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        doctorId: review.doctor_id,
        patientId: review.patient_id,
        summaryId: review.summary_id,
        reviewText: review.review_text,
        status: review.status,
        reviewedAt: review.reviewed_at,
        doctorName: doctorProfile.full_name,
        doctorSpecialization: doctorProfile.specialization,
      },
      message: 'Review successfully recorded with Doctor Reviewed ★ badge.',
    });
  } catch (err: any) {
    console.error('Error submitting doctor review:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
