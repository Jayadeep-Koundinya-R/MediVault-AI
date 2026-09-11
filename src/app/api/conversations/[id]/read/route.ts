import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let conversationId = context.params?.id;
  if (!conversationId) {
    const segments = new URL(request.url).pathname.split('/');
    const rIdx = segments.indexOf('read');
    conversationId = rIdx > 0 ? segments[rIdx - 1] : segments[segments.length - 1];
  }

  try {
    const pool = getPgPool();

    // Mark unread messages sent by the other participant as read
    const res = await pool.query(
      `UPDATE messages 
       SET read_at = now() 
       WHERE conversation_id = $1 
       AND sender_id != $2 
       AND read_at IS NULL
       RETURNING id;`,
      [conversationId, user.id]
    );

    return NextResponse.json({
      success: true,
      markedReadCount: res.rowCount,
    });
  } catch (err: any) {
    console.error('Error marking conversation read:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to mark read' },
      { status: 500 }
    );
  }
}

export const POST = PATCH;
