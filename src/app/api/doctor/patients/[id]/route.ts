import { NextResponse } from 'next/server';
import { getAuthenticatedDoctor, getPgPool, logAccess } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params?: { id?: string } }) {
  const { user, doctorProfile, error } = await getAuthenticatedDoctor(request);
  if (!user || !doctorProfile) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 403 });
  }

  // Extract patientId from context or URL pathname
  let patientId = context.params?.id;
  if (!patientId) {
    const segments = new URL(request.url).pathname.split('/');
    patientId = segments[segments.length - 1] === '' ? segments[segments.length - 2] : segments[segments.length - 1];
  }

  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const pool = getPgPool();

    // Verify relationship and fetch permissions
    const relRes = await pool.query(
      `SELECT 
        r.id as "relationshipId",
        r.status,
        dap.share_summary as "shareSummary",
        dap.share_labs as "shareLabs",
        dap.share_prescriptions as "sharePrescriptions",
        dap.share_vaccinations as "shareVaccinations",
        dap.share_original_documents as "shareOriginalDocuments"
       FROM doctor_patient_relationships r
       LEFT JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
       WHERE r.doctor_id = $1 AND r.patient_id = $2`,
      [user.id, patientId]
    );

    if (relRes.rows.length === 0 || relRes.rows[0].status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'You do not have active trusted access to this patient.' },
        { status: 403 }
      );
    }

    const perms = relRes.rows[0];

    // Fetch patient profile
    const profRes = await pool.query(
      `SELECT id, full_name as "fullName", email, date_of_birth as "dateOfBirth", blood_group as "bloodGroup", phone 
       FROM profiles WHERE id = $1`,
      [patientId]
    );
    const patientProfile = profRes.rows[0];

    // Conditionally load data based strictly on patient permissions
    let summaries: any[] = [];
    let labResults: any[] = [];
    let riskFlags: any[] = [];
    let prescriptions: any[] = [];
    let vaccinations: any[] = [];
    let documents: any[] = [];

    if (perms.shareSummary) {
      const sumRes = await pool.query(
        `SELECT 
          s.id,
          s.user_id as "userId",
          s.generated_at as "generatedAt",
          s.summary_text as "summaryText",
          s.trend_notes as "trendNotes",
          s.model_name as "modelName",
          s.model_provider as "modelProvider",
          (
            SELECT json_agg(
              json_build_object(
                'id', dr.id,
                'doctorId', dr.doctor_id,
                'reviewText', dr.review_text,
                'reviewedAt', dr.reviewed_at,
                'status', dr.status,
                'doctorName', dp.full_name,
                'doctorSpecialization', dp.specialization,
                'doctorClinic', dp.clinic_name
              )
            )
            FROM doctor_reviews dr
            JOIN doctor_profiles dp ON dp.user_id = dr.doctor_id
            WHERE dr.summary_id = s.id
          ) as "doctorReviews"
         FROM summaries s
         WHERE s.user_id = $1
         ORDER BY s.generated_at DESC;`,
        [patientId]
      );
      summaries = sumRes.rows.map((r) => ({
        ...r,
        isDoctorReviewed: Boolean(r.doctorReviews && r.doctorReviews.length > 0),
      }));
    }

    if (perms.shareLabs) {
      const labsRes = await pool.query(
        `SELECT 
          id, document_id as "documentId", user_id as "userId", 
          test_name as "testName", value, unit, 
          reference_range_low as "referenceRangeLow", 
          reference_range_high as "referenceRangeHigh", 
          test_date as "testDate", source_lab as "sourceLab", 
          manually_corrected as "manuallyCorrected"
         FROM lab_results 
         WHERE user_id = $1 
         ORDER BY test_date DESC;`,
        [patientId]
      );
      labResults = labsRes.rows;

      const flagsRes = await pool.query(
        `SELECT 
          id, user_id as "userId", lab_result_id as "labResultId",
          rule_triggered as "ruleTriggered", threshold_description as "thresholdDescription",
          severity, flagged_at as "flaggedAt", acknowledged
         FROM risk_flags 
         WHERE user_id = $1 
         ORDER BY flagged_at DESC;`,
        [patientId]
      );
      riskFlags = flagsRes.rows;
    }

    if (perms.sharePrescriptions) {
      const rxRes = await pool.query(
        `SELECT 
          id, document_id as "documentId", user_id as "userId",
          drug_name as "drugName", dosage, frequency,
          prescribed_date as "prescribedDate", prescribing_doctor as "prescribingDoctor",
          source_hospital as "sourceHospital", manually_corrected as "manuallyCorrected"
         FROM prescriptions 
         WHERE user_id = $1 
         ORDER BY prescribed_date DESC;`,
        [patientId]
      );
      prescriptions = rxRes.rows;
    }

    if (perms.shareVaccinations) {
      const vaxRes = await pool.query(
        `SELECT 
          id, document_id as "documentId", user_id as "userId",
          vaccine_name as "vaccineName", dose_number as "doseNumber",
          date_administered as "dateAdministered", facility,
          next_due_date as "nextDueDate"
         FROM vaccinations 
         WHERE user_id = $1 
         ORDER BY date_administered DESC;`,
        [patientId]
      );
      vaccinations = vaxRes.rows;
    }

    if (perms.shareOriginalDocuments) {
      const docRes = await pool.query(
        `SELECT 
          id, user_id as "userId", type, original_filename as "originalFilename",
          uploaded_at as "uploadedAt", ocr_status as "ocrStatus",
          image_path as "imagePath"
         FROM documents 
         WHERE user_id = $1 
         ORDER BY uploaded_at DESC;`,
        [patientId]
      );
      documents = docRes.rows;
    }

    // Log access
    await logAccess({
      actorUserId: user.id,
      patientUserId: patientId,
      action: 'doctor_viewed_patient_records',
      resourceType: 'patient_profile',
      resourceId: patientId,
    });

    return NextResponse.json({
      success: true,
      patient: {
        ...patientProfile,
        summary: summaries.length > 0 ? summaries[0] : null,
        summaries,
        prescriptions,
        labs: labResults,
        labResults,
        riskFlags,
        vaccinations,
        documents,
      },
      permissions: perms,
      data: {
        summary: summaries.length > 0 ? summaries[0] : null,
        summaries,
        labs: labResults,
        labResults,
        riskFlags,
        prescriptions,
        vaccinations,
        documents,
      },
    });
  } catch (err: any) {
    console.error('Error fetching patient records for doctor:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patient records' },
      { status: 500 }
    );
  }
}
