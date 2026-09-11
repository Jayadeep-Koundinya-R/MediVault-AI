import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let conversationId = context.params?.id;
  if (!conversationId) {
    const segments = new URL(request.url).pathname.split('/');
    const mIdx = segments.indexOf('messages');
    conversationId = mIdx > 0 ? segments[mIdx - 1] : segments[segments.length - 1];
  }

  try {
    const pool = getPgPool();

    // Verify caller is a participant in this conversation
    const convRes = await pool.query(
      `SELECT id, patient_id, doctor_id FROM conversations 
       WHERE id = $1 AND (patient_id = $2 OR doctor_id = $2);`,
      [conversationId, user.id]
    );

    if (convRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Conversation not found or unauthorized' }, { status: 403 });
    }

    // Fetch messages
    const res = await pool.query(
      `SELECT 
        m.id,
        m.conversation_id as "conversationId",
        m.sender_id as "senderId",
        m.message_text as "messageText",
        m.shared_summary_id as "sharedSummaryId",
        m.read_at as "readAt",
        m.created_at as "createdAt",
        (
          SELECT json_build_object(
            'id', s.id,
            'generatedAt', s.generated_at,
            'summaryText', s.summary_text,
            'trendCount', cardinality(s.source_lab_result_ids),
            'flagCount', (SELECT COUNT(*)::int FROM risk_flags rf WHERE rf.user_id = s.user_id)
          )
          FROM summaries s 
          WHERE s.id = m.shared_summary_id
        ) as "sharedSummary"
      FROM messages m
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC;`,
      [conversationId]
    );

    return NextResponse.json({
      success: true,
      messages: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { params?: { id?: string } }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  let conversationId = context.params?.id;
  if (!conversationId) {
    const segments = new URL(request.url).pathname.split('/');
    const mIdx = segments.indexOf('messages');
    conversationId = mIdx > 0 ? segments[mIdx - 1] : segments[segments.length - 1];
  }

  try {
    const body = await request.json();
    const messageText = body.messageText?.trim();
    const sharedSummaryId = body.sharedSummaryId || null;

    if (!messageText && !sharedSummaryId) {
      return NextResponse.json({ success: false, error: 'Message text or summary is required' }, { status: 400 });
    }

    if (messageText && messageText.length > 5000) {
      return NextResponse.json({ success: false, error: 'Message exceeds maximum allowable length (5000 characters)' }, { status: 400 });
    }

    const pool = getPgPool();

    // Verify caller is a participant in this conversation
    const convRes = await pool.query(
      `SELECT c.id, c.patient_id, c.doctor_id,
              p.full_name as patient_name,
              dp.full_name as doctor_name
       FROM conversations c
       LEFT JOIN profiles p ON p.id = c.patient_id
       LEFT JOIN doctor_profiles dp ON dp.user_id = c.doctor_id
       WHERE c.id = $1 AND (c.patient_id = $2 OR c.doctor_id = $2);`,
      [conversationId, user.id]
    );

    if (convRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Conversation not found or unauthorized' }, { status: 403 });
    }

    const conv = convRes.rows[0];
    const isPatientSender = user.id === conv.patient_id;
    const recipientId = isPatientSender ? conv.doctor_id : conv.patient_id;
    const senderName = isPatientSender ? (conv.patient_name || 'Patient') : `Dr. ${conv.doctor_name || 'Doctor'}`;

    // Insert message
    const insRes = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, message_text, shared_summary_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [conversationId, user.id, messageText || 'Shared an AI Health Summary', sharedSummaryId]
    );

    const msg = insRes.rows[0];

    // Update conversation timestamp
    await pool.query(`UPDATE conversations SET updated_at = now() WHERE id = $1`, [conversationId]);

    // Send recipient notification
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_id)
       VALUES ($1, 'new_message', $2, $3, $4);`,
      [
        recipientId,
        `New message from ${senderName}`,
        (messageText || 'Shared an AI Health Summary').slice(0, 100),
        conversationId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        messageText: msg.message_text,
        sharedSummaryId: msg.shared_summary_id,
        readAt: msg.read_at,
        createdAt: msg.created_at,
      },
    });
  } catch (err: any) {
    console.error('Error sending message:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
