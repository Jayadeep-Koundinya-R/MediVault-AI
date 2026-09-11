import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(token || undefined);

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (pErr) throw pErr;

    const { data: consent } = await supabase
      .from('health_consents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || '',
        dateOfBirth: profile?.date_of_birth || null,
        bloodGroup: profile?.blood_group || null,
        phone: profile?.phone || null,
        consentGiven: consent?.consented ?? false,
        consentVersion: consent?.consent_version ?? null,
        consentedAt: consent?.consented_at ?? null,
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient(token || undefined);

    const updatePayload: Record<string, unknown> = {};
    if (body.fullName !== undefined) updatePayload.full_name = body.fullName;
    if (body.dateOfBirth !== undefined) updatePayload.date_of_birth = body.dateOfBirth;
    if (body.bloodGroup !== undefined) updatePayload.blood_group = body.bloodGroup;
    if (body.phone !== undefined) updatePayload.phone = body.phone;

    const { data: updated, error: uErr } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (uErr) throw uErr;

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error updating profile' },
      { status: 500 }
    );
  }
}
