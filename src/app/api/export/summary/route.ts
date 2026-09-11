import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Fetch active prescriptions
    const { data: rxs } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('prescribed_date', { ascending: false });

    // Fetch lab results
    const { data: labs } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    // Fetch risk flags
    const { data: flags } = await supabase
      .from('risk_flags')
      .select('*')
      .eq('user_id', user.id)
      .order('flagged_at', { ascending: false });

    // Fetch vaccinations
    const { data: vaxes } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', user.id)
      .order('date_administered', { ascending: false });

    const patientName = profile?.full_name || 'Patient';
    const dob = profile?.date_of_birth || 'Not specified';
    const bloodGroup = profile?.blood_group || 'Not recorded';

    // Format Clinical Brief
    const clinicalBriefText = `=====================================================
HEALTHVAULT CLINICAL CONSULTATION BRIEF
Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
=====================================================

1. PATIENT DEMOGRAPHICS
Name: ${patientName}
Date of Birth: ${dob}
Blood Group: ${bloodGroup}
Patient ID: ${user.id.substring(0, 8)}

2. ACTIVE PHARMACOTHERAPY
${
  rxs && rxs.length > 0
    ? rxs
        .map(
          (r, i) =>
            `${i + 1}. ${r.drug_name} ${r.dosage} — ${r.frequency} (Prescribed: ${r.prescribed_date}${
              r.prescribing_doctor ? ` by ${r.prescribing_doctor}` : ''
            })`
        )
        .join('\n')
    : 'No active prescriptions recorded.'
}

3. CRITICAL CLINICAL FLAGS (DETERMINISTIC THRESHOLDS)
${
  flags && flags.length > 0
    ? flags
        .map(
          (f, i) =>
            `${i + 1}. [${f.severity.toUpperCase()}] ${f.rule_triggered}: ${f.threshold_description}`
        )
        .join('\n')
    : 'No active clinical threshold flags triggered.'
}

4. RECENT LABORATORY PANELS
${
  labs && labs.length > 0
    ? labs
        .slice(0, 10)
        .map(
          (l) =>
            `- ${l.test_date} | ${l.test_name}: ${l.value} ${l.unit} ${
              l.reference_range_high ? `(Ref: ${l.reference_range_low || 0}-${l.reference_range_high})` : ''
            }`
        )
        .join('\n')
    : 'No laboratory data available.'
}

5. IMMUNIZATION HISTORY
${
  vaxes && vaxes.length > 0
    ? vaxes
        .map((v) => `- ${v.vaccine_name} (Dose ${v.dose_number}) on ${v.date_administered}`)
        .join('\n')
    : 'No vaccination records found.'
}

=====================================================
CONFIDENTIAL MEDICAL SUMMARY - PREPARED VIA HEALTHVAULT
DISCLAIMER: Patient-curated synthesis. Confirm against primary source documentation.
=====================================================`;

    return NextResponse.json({
      success: true,
      data: {
        formattedText: clinicalBriefText,
        demographics: {
          name: patientName,
          dob,
          bloodGroup,
        },
        prescriptionCount: rxs?.length || 0,
        labCount: labs?.length || 0,
        flagCount: flags?.length || 0,
      },
    });
  } catch (err) {
    console.error('Export summary error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error generating clinical brief' },
      { status: 500 }
    );
  }
}
