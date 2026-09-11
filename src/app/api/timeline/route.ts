import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';
  const category = searchParams.get('category') || 'all';
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    const timelineItems: Array<{
      id: string;
      date: string;
      type: 'prescription' | 'lab_report' | 'vaccination';
      title: string;
      subtitle: string;
      details: string;
      source: string;
      documentId?: string;
      tags: string[];
      hasFlag?: boolean;
    }> = [];

    // 1. Fetch Prescriptions
    if (category === 'all' || category === 'prescription') {
      let query = supabase.from('prescriptions').select('*').eq('user_id', user.id);
      if (fromDate) query = query.gte('prescribed_date', fromDate);
      if (toDate) query = query.lte('prescribed_date', toDate);

      const { data: rxs, error: rxErr } = await query;
      if (rxErr) throw rxErr;

      for (const rx of rxs || []) {
        timelineItems.push({
          id: `rx-${rx.id}`,
          date: rx.prescribed_date,
          type: 'prescription',
          title: rx.drug_name,
          subtitle: `${rx.dosage} • ${rx.frequency}`,
          details: rx.prescribing_doctor ? `Prescribed by ${rx.prescribing_doctor}` : 'Prescription',
          source: rx.source_hospital || rx.prescribing_doctor || 'Clinic',
          documentId: rx.document_id || undefined,
          tags: ['Prescription', rx.drug_name],
        });
      }
    }

    // 2. Fetch Lab Results
    if (category === 'all' || category === 'lab_report') {
      let query = supabase.from('lab_results').select('*').eq('user_id', user.id);
      if (fromDate) query = query.gte('test_date', fromDate);
      if (toDate) query = query.lte('test_date', toDate);

      const { data: labs, error: labErr } = await query;
      if (labErr) throw labErr;

      // Group lab results by test_date and source_lab/document_id
      for (const lab of labs || []) {
        const rangeStr = lab.reference_range_high
          ? ` (Ref: ${lab.reference_range_low || 0}-${lab.reference_range_high} ${lab.unit})`
          : '';
        timelineItems.push({
          id: `lab-${lab.id}`,
          date: lab.test_date,
          type: 'lab_report',
          title: lab.test_name,
          subtitle: `${lab.value} ${lab.unit}${rangeStr}`,
          details: lab.source_lab ? `Laboratory: ${lab.source_lab}` : 'Lab Result',
          source: lab.source_lab || 'Diagnostic Lab',
          documentId: lab.document_id || undefined,
          tags: ['Lab Report', lab.test_name],
        });
      }
    }

    // 3. Fetch Vaccinations
    if (category === 'all' || category === 'vaccination') {
      let query = supabase.from('vaccinations').select('*').eq('user_id', user.id);
      if (fromDate) query = query.gte('date_administered', fromDate);
      if (toDate) query = query.lte('date_administered', toDate);

      const { data: vaxes, error: vaxErr } = await query;
      if (vaxErr) throw vaxErr;

      for (const vax of vaxes || []) {
        timelineItems.push({
          id: `vax-${vax.id}`,
          date: vax.date_administered,
          type: 'vaccination',
          title: vax.vaccine_name,
          subtitle: `Dose ${vax.dose_number}${vax.next_due_date ? ` • Next due: ${vax.next_due_date}` : ''}`,
          details: vax.facility ? `Administered at ${vax.facility}` : 'Vaccination Record',
          source: vax.facility || 'Immunization Center',
          documentId: vax.document_id || undefined,
          tags: ['Vaccination', vax.vaccine_name],
        });
      }
    }

    // Sort descending by date
    let filtered = timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter by text search query if provided
    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err) {
    console.error('Timeline fetch error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error fetching timeline' },
      { status: 500 }
    );
  }
}
