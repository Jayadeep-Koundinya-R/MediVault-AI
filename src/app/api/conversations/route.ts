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

    // Fetch conversations where user is patient or doctor
    const res = await pool.query(
      `SELECT 
        c.id,
        c.patient_id as "patientId",
        c.doctor_id as "doctorId",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        CASE 
          WHEN c.patient_id = $1 THEN dp.full_name
          ELSE p.full_name
        END as "partnerName",
        CASE 
          WHEN c.patient_id = $1 THEN dp.specialization
          ELSE 'Patient'
        END as "partnerRole",
        dp.clinic_name as "partnerClinic",
        dp.verification_status = 'verified' as "isVerified",
        (
          SELECT json_build_object(
            'id', m.id,
            'messageText', m.message_text,
            'senderId', m.sender_id,
            'createdAt', m.created_at,
            'readAt', m.read_at,
            'sharedSummaryId', m.shared_summary_id
          )
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as "lastMessage",
        (
          SELECT COUNT(*)::int 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          AND m.sender_id != $1 
          AND m.read_at IS NULL
        ) as "unreadCount"
      FROM conversations c
      LEFT JOIN profiles p ON p.id = c.patient_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = c.doctor_id
      WHERE c.patient_id = $1 OR c.doctor_id = $1
      ORDER BY c.updated_at DESC;`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      conversations: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching conversations:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { doctorId, patientId } = body;

    const targetDoctorId = doctorId || (user.id === patientId ? undefined : user.id);
    const targetPatientId = patientId || (user.id === doctorId ? undefined : user.id);

    if (!targetDoctorId || !targetPatientId) {
      return NextResponse.json({ success: false, error: 'Doctor ID and Patient ID are required' }, { status: 400 });
    }

    const pool = getPgPool();

    // Verify caller is one of the participants
    if (user.id !== targetDoctorId && user.id !== targetPatientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to start this conversation' }, { status: 403 });
    }

    // Verify relationship is accepted
    const relRes = await pool.query(
      `SELECT id, status FROM doctor_patient_relationships 
       WHERE doctor_id = $1 AND patient_id = $2 AND status = 'accepted';`,
      [targetDoctorId, targetPatientId]
    );

    if (relRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Chat is only available for accepted trusted doctor connections.' },
        { status: 403 }
      );
    }

    // Create or get conversation
    const insRes = await pool.query(
      `INSERT INTO conversations (patient_id, doctor_id)
       VALUES ($1, $2)
       ON CONFLICT (patient_id, doctor_id) 
       DO UPDATE SET updated_at = now()
       RETURNING *;`,
      [targetPatientId, targetDoctorId]
    );

    return NextResponse.json({
      success: true,
      conversation: insRes.rows[0],
    });
  } catch (err: any) {
    console.error('Error starting conversation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
