import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool, logAccess } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPgPool();
    // Fetch user account type
    const profRes = await pool.query(`SELECT account_type, full_name FROM profiles WHERE id = $1`, [user.id]);
    const accountType = profRes.rows[0]?.account_type || 'patient';

    let query: string;
    let params: any[] = [user.id];

    if (accountType === 'doctor') {
      // Doctor view: fetch requests & connected patients
      query = `
        SELECT 
          r.id,
          r.doctor_id as "doctorId",
          r.patient_id as "patientId",
          r.status,
          r.requested_by as "requestedBy",
          r.created_at as "createdAt",
          r.accepted_at as "acceptedAt",
          r.revoked_at as "revokedAt",
          json_build_object(
            'id', p.id,
            'fullName', p.full_name,
            'email', p.email,
            'dateOfBirth', p.date_of_birth
          ) as "patientProfile",
          json_build_object(
            'id', dap.id,
            'shareSummary', dap.share_summary,
            'shareLabs', dap.share_labs,
            'sharePrescriptions', dap.share_prescriptions,
            'shareVaccinations', dap.share_vaccinations,
            'shareOriginalDocuments', dap.share_original_documents
          ) as "permissions"
        FROM doctor_patient_relationships r
        JOIN profiles p ON p.id = r.patient_id
        LEFT JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
        WHERE r.doctor_id = $1
        ORDER BY r.created_at DESC;
      `;
    } else {
      // Patient view: fetch requests sent to doctors
      query = `
        SELECT 
          r.id,
          r.doctor_id as "doctorId",
          r.patient_id as "patientId",
          r.status,
          r.requested_by as "requestedBy",
          r.created_at as "createdAt",
          r.accepted_at as "acceptedAt",
          r.revoked_at as "revokedAt",
          json_build_object(
            'id', dp.id,
            'userId', dp.user_id,
            'fullName', dp.full_name,
            'specialization', dp.specialization,
            'clinicName', dp.clinic_name,
            'yearsOfExperience', dp.years_of_experience,
            'verificationStatus', dp.verification_status
          ) as "doctorProfile",
          json_build_object(
            'id', dap.id,
            'shareSummary', dap.share_summary,
            'shareLabs', dap.share_labs,
            'sharePrescriptions', dap.share_prescriptions,
            'shareVaccinations', dap.share_vaccinations,
            'shareOriginalDocuments', dap.share_original_documents
          ) as "permissions"
        FROM doctor_patient_relationships r
        JOIN doctor_profiles dp ON dp.user_id = r.doctor_id
        LEFT JOIN doctor_access_permissions dap ON dap.relationship_id = r.id
        WHERE r.patient_id = $1
        ORDER BY r.created_at DESC;
      `;
    }

    const res = await pool.query(query, params);
    return NextResponse.json({
      success: true,
      accountType,
      requests: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching doctor requests:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch doctor requests' },
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
    const doctorId = body.doctorId;

    if (!doctorId) {
      return NextResponse.json({ success: false, error: 'Doctor ID is required' }, { status: 400 });
    }

    const pool = getPgPool();

    // Verify target is a valid doctor
    const docRes = await pool.query(`SELECT user_id, full_name, verification_status FROM doctor_profiles WHERE user_id::text = $1 OR id::text = $1`, [doctorId]);
    if (docRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }
    const doctor = docRes.rows[0];

    // Check for existing relationship
    const existing = await pool.query(
      `SELECT id, status FROM doctor_patient_relationships WHERE doctor_id = $1 AND patient_id = $2`,
      [doctor.user_id, user.id]
    );

    let relationshipId: string;

    if (existing.rows.length > 0) {
      const rel = existing.rows[0];
      if (rel.status === 'accepted') {
        return NextResponse.json({ success: false, error: 'You are already connected to this doctor.' }, { status: 409 });
      } else if (rel.status === 'pending') {
        return NextResponse.json({ success: false, error: 'A connection request is already pending with this doctor.' }, { status: 409 });
      } else {
        // Was revoked or declined, reinstate as pending
        const updateRes = await pool.query(
          `UPDATE doctor_patient_relationships 
           SET status = 'pending', requested_by = $1, created_at = now(), revoked_at = NULL 
           WHERE id = $2 RETURNING id;`,
          [user.id, rel.id]
        );
        relationshipId = updateRes.rows[0].id;
      }
    } else {
      // Insert new relationship (trigger creates default doctor_access_permissions)
      const insRes = await pool.query(
        `INSERT INTO doctor_patient_relationships (doctor_id, patient_id, status, requested_by)
         VALUES ($1, $2, 'pending', $3)
         RETURNING id;`,
        [doctor.user_id, user.id, user.id]
      );
      relationshipId = insRes.rows[0].id;
    }

    // Get patient's full name for notification
    const patRes = await pool.query(`SELECT full_name FROM profiles WHERE id = $1`, [user.id]);
    const patientName = patRes.rows[0]?.full_name || 'A patient';

    // Notify doctor
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_id)
       VALUES ($1, 'doctor_request', 'New patient connection request', $2, $3);`,
      [doctor.user_id, `${patientName} has requested to connect with you.`, relationshipId]
    );

    return NextResponse.json({
      success: true,
      relationshipId,
      relationship: { id: relationshipId },
      message: 'Connection request sent to doctor.',
    });
  } catch (err: any) {
    console.error('Error creating doctor request:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create doctor request' },
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
    const body = await request.json();
    const requestId = body.requestId || body.relationshipId;
    const { status, permissions } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const pool = getPgPool();

    // Verify access to relationship
    const relRes = await pool.query(
      `SELECT r.*, dp.full_name as doctor_name, p.full_name as patient_name 
       FROM doctor_patient_relationships r
       LEFT JOIN doctor_profiles dp ON dp.user_id = r.doctor_id
       LEFT JOIN profiles p ON p.id = r.patient_id
       WHERE r.id = $1`,
      [requestId]
    );

    if (relRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Relationship not found' }, { status: 404 });
    }

    const rel = relRes.rows[0];
    const isDoctor = rel.doctor_id === user.id;
    const isPatient = rel.patient_id === user.id;

    if (!isDoctor && !isPatient) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify this relationship' }, { status: 403 });
    }

    // Status transition handling
    if (status) {
      if (status === 'accepted' || status === 'declined') {
        if (!isDoctor) {
          return NextResponse.json({ success: false, error: 'Only the doctor can accept or decline requests' }, { status: 403 });
        }
        await pool.query(
          `UPDATE doctor_patient_relationships 
           SET status = $1, accepted_at = ${status === 'accepted' ? 'now()' : 'NULL'} 
           WHERE id = $2`,
          [status, requestId]
        );

        if (status === 'accepted') {
          // Notify patient
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, body, related_id)
             VALUES ($1, 'doctor_request_accepted', 'Connection Request Accepted', $2, $3);`,
            [rel.patient_id, `Dr. ${rel.doctor_name || 'Your doctor'} accepted your connection request.`, requestId]
          );

          // Create primary conversation between patient and doctor
          await pool.query(
            `INSERT INTO conversations (patient_id, doctor_id)
             VALUES ($1, $2)
             ON CONFLICT (patient_id, doctor_id) DO NOTHING;`,
            [rel.patient_id, rel.doctor_id]
          );
        }
      } else if (status === 'revoked') {
        // Patient revoking access
        await pool.query(
          `UPDATE doctor_patient_relationships 
           SET status = 'revoked', revoked_at = now() 
           WHERE id = $1`,
          [requestId]
        );
        await logAccess({
          actorUserId: user.id,
          patientUserId: rel.patient_id,
          action: 'patient_revoked_access',
          resourceType: 'doctor_relationship',
          resourceId: requestId,
        });
      }
    }

    // Permission updates by patient
    if (permissions && isPatient) {
      const {
        shareSummary,
        shareLabs,
        sharePrescriptions,
        shareVaccinations,
        shareOriginalDocuments,
      } = permissions;

      await pool.query(
        `INSERT INTO doctor_access_permissions (
          relationship_id, share_summary, share_labs, share_prescriptions, share_vaccinations, share_original_documents, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, now())
        ON CONFLICT (relationship_id) DO UPDATE SET
          share_summary = EXCLUDED.share_summary,
          share_labs = EXCLUDED.share_labs,
          share_prescriptions = EXCLUDED.share_prescriptions,
          share_vaccinations = EXCLUDED.share_vaccinations,
          share_original_documents = EXCLUDED.share_original_documents,
          updated_at = now();`,
        [
          requestId,
          shareSummary ?? true,
          shareLabs ?? false,
          sharePrescriptions ?? false,
          shareVaccinations ?? false,
          shareOriginalDocuments ?? false,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Relationship updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating doctor request:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}
