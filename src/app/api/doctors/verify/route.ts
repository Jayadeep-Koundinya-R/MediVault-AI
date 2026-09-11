import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetUserId = body.userId || user.id;
    const status = body.status || 'verified';

    const pool = getPgPool();
    const res = await pool.query(
      `UPDATE doctor_profiles 
       SET verification_status = $1, updated_at = now() 
       WHERE user_id = $2 
       RETURNING *;`,
      [status, targetUserId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Doctor profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      doctor: res.rows[0],
      message: `Doctor verification updated to: ${status}`,
    });
  } catch (err: any) {
    console.error('Error verifying doctor:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to verify doctor' },
      { status: 500 }
    );
  }
}
