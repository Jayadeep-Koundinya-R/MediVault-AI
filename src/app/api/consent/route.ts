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

    const { data: consent, error: cErr } = await supabase
      .from('health_consents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cErr) throw cErr;

    return NextResponse.json({
      success: true,
      data: consent || { consented: false, consent_version: '1.0' },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error checking consent' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const consented = body.consented === true;
    const version = body.version || '1.0';

    const supabase = createServerSupabaseClient(token || undefined);

    const insertPayload = {
      user_id: user.id,
      consent_version: version,
      consented,
      consented_at: consented ? new Date().toISOString() : null,
      withdrawn_at: consented ? null : new Date().toISOString(),
    };

    const { data: inserted, error: iErr } = await supabase
      .from('health_consents')
      .insert(insertPayload)
      .select()
      .single();

    if (iErr) throw iErr;

    return NextResponse.json({
      success: true,
      data: inserted,
    });
  } catch (err) {
    console.error('Error saving consent:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error recording consent' },
      { status: 500 }
    );
  }
}
