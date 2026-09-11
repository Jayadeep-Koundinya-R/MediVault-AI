import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../../lib/supabase/server';
import { generateDynamicHealthSummary } from '../../../../lib/ai/ollama';
import { evaluateLabResults } from '../../../../lib/health/thresholds';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve the latest generated summary and active clinical risk flags
 */
export async function GET(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    // Fetch latest summary
    const { data: summaries, error: sumError } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(1);

    if (sumError) {
      throw new Error(`Database error fetching summary: ${sumError.message}`);
    }

    // Fetch active risk flags
    const { data: riskFlags, error: flagError } = await supabase
      .from('risk_flags')
      .select('*, lab_results(test_name, value, unit, test_date)')
      .eq('user_id', user.id)
      .order('flagged_at', { ascending: false });

    if (flagError) {
      throw new Error(`Database error fetching risk flags: ${flagError.message}`);
    }

    let latestSummary = summaries && summaries.length > 0 ? summaries[0] : null;

    if (latestSummary) {
      const { getPgPool } = await import('../../../../lib/supabase/server');
      const pool = getPgPool();
      const revRes = await pool.query(
        `SELECT 
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
          dp.clinic_name as "doctorClinic"
         FROM doctor_reviews dr
         LEFT JOIN doctor_profiles dp ON dp.user_id = dr.doctor_id
         WHERE dr.summary_id = $1
         ORDER BY dr.reviewed_at DESC`,
        [latestSummary.id]
      );
      const reviews = revRes.rows;
      latestSummary = {
        ...latestSummary,
        doctorReviews: reviews,
        isDoctorReviewed: reviews.length > 0,
      };
    }

    return NextResponse.json({
      success: true,
      summary: latestSummary,
      data: {
        summary: latestSummary,
        riskFlags: riskFlags || [],
      },
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error fetching summary' },
      { status: 500 }
    );
  }
}

/**
 * POST: Dynamically generate a fresh summary via Ollama + Qwen using current database records
 */
export async function POST(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    // 1. Fetch user profile for patient name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Fetch all user lab results
    const { data: labs, error: labsErr } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    if (labsErr) throw new Error(`Failed to load lab results: ${labsErr.message}`);

    // 3. Fetch all user prescriptions
    const { data: prescriptions, error: rxErr } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('prescribed_date', { ascending: false });

    if (rxErr) throw new Error(`Failed to load prescriptions: ${rxErr.message}`);

    // 4. Fetch all user vaccinations
    const { data: vaxes, error: vaxErr } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', user.id)
      .order('date_administered', { ascending: false });

    if (vaxErr) throw new Error(`Failed to load vaccinations: ${vaxErr.message}`);

    // 5. Evaluate deterministic clinical threshold engine
    const evaluatedFlags = evaluateLabResults(
      (labs || []).map((l) => ({
        id: l.id,
        test_name: l.test_name,
        value: Number(l.value),
        unit: l.unit,
        reference_range_low: l.reference_range_low,
        reference_range_high: l.reference_range_high,
        test_date: l.test_date,
      }))
    );

    // Upsert or insert risk flags
    if (evaluatedFlags.length > 0) {
      // Clear previous unacknowledged flags and insert fresh ones
      await supabase.from('risk_flags').delete().eq('user_id', user.id).eq('acknowledged', false);

      const flagInserts = evaluatedFlags.map((f) => ({
        user_id: user.id,
        lab_result_id: f.lab_result_id || null,
        rule_triggered: f.rule_triggered,
        threshold_description: f.threshold_description,
        severity: f.severity,
        flagged_at: f.flagged_at,
      }));

      await supabase.from('risk_flags').insert(flagInserts);
    }

    // 6. Generate dynamic AI summary with real local Ollama + Qwen
    const aiResult = await generateDynamicHealthSummary({
      patientName: profile?.full_name || user.email || 'Patient',
      prescriptions: (prescriptions || []).map((p) => ({
        drug_name: p.drug_name,
        dosage: p.dosage,
        frequency: p.frequency,
        prescribed_date: p.prescribed_date,
      })),
      labResults: (labs || []).map((l) => ({
        test_name: l.test_name,
        value: Number(l.value),
        unit: l.unit,
        test_date: l.test_date,
        reference_range_low: l.reference_range_low,
        reference_range_high: l.reference_range_high,
      })),
      vaccinations: (vaxes || []).map((v) => ({
        vaccine_name: v.vaccine_name,
        dose_number: v.dose_number,
        date_administered: v.date_administered,
      })),
      riskFlags: evaluatedFlags.map((f) => ({
        rule_triggered: f.rule_triggered,
        threshold_description: f.threshold_description,
        severity: f.severity,
        test_name: f.test_name,
        value: f.value,
        unit: f.unit,
      })),
    });

    // 7. Persist generated summary in database
    const labIds = (labs || []).map((l) => l.id);
    const rxIds = (prescriptions || []).map((p) => p.id);

    const { data: insertedSummary, error: insErr } = await supabase
      .from('summaries')
      .insert({
        user_id: user.id,
        generated_at: new Date().toISOString(),
        summary_text: aiResult.summary.overview,
        source_lab_result_ids: labIds,
        source_prescription_ids: rxIds,
        trend_notes: aiResult.summary.trends,
        model_name: aiResult.modelName,
        model_provider: 'ollama',
        generation_metadata: {
          observations: aiResult.summary.observations,
          suggestedQuestions: aiResult.summary.suggestedQuestionsForDoctor,
          disclaimer: aiResult.summary.disclaimer,
          totalLabsAnalyzed: labs?.length || 0,
          totalPrescriptionsAnalyzed: prescriptions?.length || 0,
        },
      })
      .select()
      .single();

    if (insErr) {
      throw new Error(`Failed to persist summary: ${insErr.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: insertedSummary,
        aiStructured: aiResult.summary,
        model: aiResult.modelName,
        riskFlags: evaluatedFlags,
      },
    });
  } catch (err) {
    console.error('Error generating summary:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'AI analysis failed',
      },
      { status: 500 }
    );
  }
}
