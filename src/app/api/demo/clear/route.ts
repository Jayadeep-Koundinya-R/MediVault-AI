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

    await supabase.from('risk_flags').delete().eq('user_id', user.id);
    await supabase.from('summaries').delete().eq('user_id', user.id);
    await supabase.from('prescriptions').delete().eq('user_id', user.id);
    await supabase.from('lab_results').delete().eq('user_id', user.id);
    await supabase.from('vaccinations').delete().eq('user_id', user.id);
    await supabase.from('documents').delete().eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'All records cleared successfully',
      userId: user.id,
    });
  } catch (err) {
    console.error('Demo clear error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to clear data' },
      { status: 500 }
    );
  }
}
