import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPgPool();
    const res = await pool.query(
      `SELECT 
        id,
        user_id as "userId",
        type,
        title,
        body,
        related_id as "relatedId",
        read,
        created_at as "createdAt"
      FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50;`,
      [user.id]
    );

    const unreadCount = res.rows.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: res.rows,
      unreadCount,
    });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { notificationId, markAllRead } = body;

    const pool = getPgPool();

    if (markAllRead) {
      await pool.query(`UPDATE notifications SET read = true WHERE user_id = $1;`, [user.id]);
    } else if (notificationId) {
      await pool.query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2;`, [notificationId, user.id]);
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (err: any) {
    console.error('Error updating notifications:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
