import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../../lib/supabase/server';
import { evaluateLabResults } from '../../../../lib/health/thresholds';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    // 1. Clean existing records for this user first
    await supabase.from('risk_flags').delete().eq('user_id', user.id);
    await supabase.from('summaries').delete().eq('user_id', user.id);
    await supabase.from('prescriptions').delete().eq('user_id', user.id);
    await supabase.from('lab_results').delete().eq('user_id', user.id);
    await supabase.from('vaccinations').delete().eq('user_id', user.id);
    await supabase.from('documents').delete().eq('user_id', user.id);

    // 2. Ensure profile exists and is updated
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: 'Rahul Sharma',
        date_of_birth: '1985-04-12',
        email: user.email,
        blood_group: 'B+',
        phone: '+91 98765 43210',
      });

    // 3. Ensure statutory consent is recorded
    await supabase
      .from('health_consents')
      .upsert({
        user_id: user.id,
        consent_version: '1.0',
        consented: true,
        consented_at: new Date().toISOString(),
      });

    // 4. Insert Seed Documents
    const { data: doc1 } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        type: 'lab_report',
        image_path: `${user.id}/demo/comprehensive_metabolic_panel.pdf`,
        ocr_status: 'success',
        raw_ocr_text: 'APOLLO HOSPITALS CLINICAL LAB\nPatient: Rahul Sharma, 40M\nDate: 01-Mar-2026\nFasting Blood Glucose: 128 mg/dL [Ref: 70-99]\nHbA1c: 6.8 % [Ref: 4.0-5.6]\nSerum Creatinine: 0.9 mg/dL [Ref: 0.7-1.3]',
        ocr_confidence: 98.5,
        original_filename: 'comprehensive_metabolic_panel.pdf',
        mime_type: 'application/pdf',
        file_size: 245120,
      })
      .select()
      .single();

    const { data: doc2 } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        type: 'prescription',
        image_path: `${user.id}/demo/apollo_prescription_march.pdf`,
        ocr_status: 'success',
        raw_ocr_text: 'DR. RAJESH SHARMA, MD\nApollo Hospitals, Department of Internal Medicine\nRx for Rahul Sharma\n1. Tab Metformin 500mg - 1 tab PO BD after meals\n2. Tab Atorvastatin 20mg - 1 tab PO HS\n3. Tab Telmisartan 40mg - 1 tab PO OD (morning)',
        ocr_confidence: 96.0,
        original_filename: 'apollo_prescription_march.pdf',
        mime_type: 'application/pdf',
        file_size: 182400,
      })
      .select()
      .single();

    const doc1Id = doc1?.id || null;
    const doc2Id = doc2?.id || null;

    // 5. Insert Prescriptions
    await supabase.from('prescriptions').insert([
      {
        user_id: user.id,
        document_id: doc2Id,
        drug_name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily after meals',
        prescribed_date: '2026-03-01',
        prescribing_doctor: 'Dr. Rajesh Sharma',
        source_hospital: 'Apollo Hospitals',
        manually_corrected: false,
      },
      {
        user_id: user.id,
        document_id: doc2Id,
        drug_name: 'Atorvastatin',
        dosage: '20 mg',
        frequency: 'Once daily at bedtime',
        prescribed_date: '2026-03-01',
        prescribing_doctor: 'Dr. Rajesh Sharma',
        source_hospital: 'Apollo Hospitals',
        manually_corrected: false,
      },
      {
        user_id: user.id,
        document_id: doc2Id,
        drug_name: 'Telmisartan',
        dosage: '40 mg',
        frequency: 'Once daily in morning',
        prescribed_date: '2026-03-01',
        prescribing_doctor: 'Dr. Rajesh Sharma',
        source_hospital: 'Apollo Hospitals',
        manually_corrected: false,
      },
    ]);

    // 6. Insert Lab Results (Longitudinal progression for Fasting Blood Sugar & HbA1c)
    const { data: insertedLabs } = await supabase.from('lab_results').insert([
      {
        user_id: user.id,
        document_id: doc1Id,
        test_name: 'Fasting Blood Sugar',
        value: 128,
        unit: 'mg/dL',
        reference_range_low: 70,
        reference_range_high: 99,
        test_date: '2026-03-01',
        source_lab: 'Apollo Diagnostics',
      },
      {
        user_id: user.id,
        document_id: null,
        test_name: 'Fasting Blood Sugar',
        value: 114,
        unit: 'mg/dL',
        reference_range_low: 70,
        reference_range_high: 99,
        test_date: '2025-10-15',
        source_lab: 'Apollo Diagnostics',
      },
      {
        user_id: user.id,
        document_id: null,
        test_name: 'Fasting Blood Sugar',
        value: 98,
        unit: 'mg/dL',
        reference_range_low: 70,
        reference_range_high: 99,
        test_date: '2025-04-10',
        source_lab: 'Apollo Diagnostics',
      },
      {
        user_id: user.id,
        document_id: doc1Id,
        test_name: 'HbA1c',
        value: 6.8,
        unit: '%',
        reference_range_low: 4.0,
        reference_range_high: 5.6,
        test_date: '2026-03-01',
        source_lab: 'Apollo Diagnostics',
      },
      {
        user_id: user.id,
        document_id: null,
        test_name: 'HbA1c',
        value: 6.2,
        unit: '%',
        reference_range_low: 4.0,
        reference_range_high: 5.6,
        test_date: '2025-10-15',
        source_lab: 'Apollo Diagnostics',
      },
      {
        user_id: user.id,
        document_id: null,
        test_name: 'LDL Cholesterol',
        value: 142,
        unit: 'mg/dL',
        reference_range_low: 0,
        reference_range_high: 100,
        test_date: '2026-02-15',
        source_lab: 'Metropolis Healthcare',
      },
      {
        user_id: user.id,
        document_id: doc1Id,
        test_name: 'Serum Creatinine',
        value: 0.9,
        unit: 'mg/dL',
        reference_range_low: 0.7,
        reference_range_high: 1.3,
        test_date: '2026-03-01',
        source_lab: 'Apollo Diagnostics',
      },
    ]).select();

    // 7. Insert Vaccinations
    await supabase.from('vaccinations').insert([
      {
        user_id: user.id,
        document_id: null,
        vaccine_name: 'Hepatitis B (Recombinant)',
        dose_number: 3,
        date_administered: '2024-06-15',
        facility: 'Apollo Medical Centre',
        next_due_date: null,
      },
      {
        user_id: user.id,
        document_id: null,
        vaccine_name: 'Tetanus Toxoid (TT Booster)',
        dose_number: 1,
        date_administered: '2025-01-20',
        facility: 'Max Multi Speciality Hospital',
        next_due_date: '2035-01-20',
      },
    ]);

    // 8. Run deterministic clinical threshold evaluation and record risk flags
    if (insertedLabs && insertedLabs.length > 0) {
      const riskFlags = evaluateLabResults(
        insertedLabs.map((l) => ({
          id: l.id,
          test_name: l.test_name,
          value: Number(l.value),
          unit: l.unit,
          reference_range_low: l.reference_range_low,
          reference_range_high: l.reference_range_high,
          test_date: l.test_date,
        }))
      );

      if (riskFlags.length > 0) {
        await supabase.from('risk_flags').insert(
          riskFlags.map((f) => ({
            user_id: user.id,
            lab_result_id: f.lab_result_id || null,
            rule_triggered: f.rule_triggered,
            threshold_description: f.threshold_description,
            severity: f.severity,
            flagged_at: f.flagged_at,
          }))
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo health records seeded successfully for user',
      userId: user.id,
    });
  } catch (err) {
    console.error('Demo seed error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
