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

    // 9. For demo patient Rahul Sharma, seed initial summary, doctor connection, chat, and family
    const isDemoPatient = user.email?.toLowerCase().includes('rahul') || user.email === 'demo.rahul@healthvault.local';
    if (isDemoPatient) {
      try {
        // A. Seed baseline AI health summary
        const { data: sumData } = await supabase
          .from('summaries')
          .insert({
            user_id: user.id,
            summary_text: 'Active Clinical Assessment: The patient is a 40-year-old male presenting with mild fasting hyperglycemia and borderline glycated hemoglobin (HbA1c 6.8%). Longitudinal laboratory trends over 12 months demonstrate positive response to Metformin 500mg BD therapy, with Fasting Blood Sugar reducing from 128 mg/dL toward normal reference range. Lipid panel reflects mild LDL cholesterol elevation (142 mg/dL) managed on Atorvastatin 20mg. Renal function (Creatinine 0.9 mg/dL) remains normal.',
            trend_notes: [
              'Fasting blood glucose declining toward target range (128 → 114 mg/dL)',
              'HbA1c stable at 6.8% under active Metformin therapy',
              'Mildly elevated LDL cholesterol (142 mg/dL) under statin management',
              'Renal function within optimal reference range (Creatinine 0.9 mg/dL)'
            ],
            model_name: 'qwen2.5:7b',
            model_provider: 'ollama',
          })
          .select()
          .maybeSingle();

        // B. Look up Dr. Ananya Rao's profile
        const { data: docProfiles } = await supabase
          .from('doctor_profiles')
          .select('id, user_id, full_name')
          .limit(1);

        const targetDoctor = docProfiles?.[0];
        if (targetDoctor && targetDoctor.user_id) {
          // Create or update doctor-patient relationship
          const { data: relData } = await supabase
            .from('doctor_patient_relationships')
            .upsert({
              doctor_id: targetDoctor.user_id,
              patient_id: user.id,
              status: 'accepted',
              requested_by: user.id,
              accepted_at: new Date().toISOString(),
            }, { onConflict: 'doctor_id,patient_id' })
            .select()
            .maybeSingle();

          if (relData) {
            await supabase
              .from('doctor_access_permissions')
              .upsert({
                relationship_id: relData.id,
                share_summary: true,
                share_labs: true,
                share_prescriptions: true,
                share_vaccinations: true,
                share_original_documents: true,
              }, { onConflict: 'relationship_id' });
          }

          // Doctor Review with "Doctor Reviewed ★" badge
          if (sumData) {
            await supabase
              .from('doctor_reviews')
              .insert({
                doctor_id: targetDoctor.user_id,
                patient_id: user.id,
                summary_id: sumData.id,
                review_text: 'Reviewed longitudinal glycemic trajectory. Glycemic control is improving with Metformin 500mg. Continue current pharmacotherapy regimen and repeat lipid panel in 12 weeks.',
                status: 'reviewed',
              });
          }

          // Conversation and chat messages
          const { data: convData } = await supabase
            .from('conversations')
            .upsert({
              patient_id: user.id,
              doctor_id: targetDoctor.user_id,
            }, { onConflict: 'patient_id,doctor_id' })
            .select()
            .maybeSingle();

          if (convData) {
            await supabase.from('messages').delete().eq('conversation_id', convData.id);
            await supabase.from('messages').insert([
              {
                conversation_id: convData.id,
                sender_id: targetDoctor.user_id,
                message_text: 'Hello Rahul, I have reviewed your latest metabolic panel and prescription records. The glycemic levels show notable improvement.',
                created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
              },
              {
                conversation_id: convData.id,
                sender_id: user.id,
                message_text: 'Thank you Dr. Ananya! Should I continue the same dosage of Metformin with meals?',
                created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
              },
              {
                conversation_id: convData.id,
                sender_id: targetDoctor.user_id,
                message_text: 'Yes, maintain 500mg twice daily after meals. Let us schedule a follow-up consultation in 6 weeks.',
                created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
              },
            ]);
          }
        }

        // C. Family Member
        const { data: famData } = await supabase
          .from('family_relationships')
          .insert({
            owner_user_id: user.id,
            member_name: 'Sunita Sharma',
            relationship_type: 'Mother',
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (famData) {
          await supabase
            .from('family_access_permissions')
            .upsert({
              family_relationship_id: famData.id,
              share_summary: true,
              share_prescriptions: true,
              share_labs: false,
              share_vaccinations: true,
              share_flags: false,
            }, { onConflict: 'family_relationship_id' });
        }
      } catch (subErr) {
        console.warn('Demo extra seed note:', subErr);
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
