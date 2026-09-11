import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetDoctorId = searchParams.get('doctorId') || user.id;

  try {
    const pool = getPgPool();
    const res = await pool.query(
      `SELECT 
        dp.id,
        dp.user_id as "userId",
        dp.full_name as "fullName",
        dp.email,
        dp.phone,
        dp.specialization,
        dp.medical_registration_number as "medicalRegistrationNumber",
        dp.registration_country as "registrationCountry",
        dp.clinic_name as "clinicName",
        dp.clinic_address as "clinicAddress",
        dp.years_of_experience as "yearsOfExperience",
        dp.bio,
        dp.profile_photo_path as "profilePhotoPath",
        dp.verification_status as "verificationStatus",
        dp.created_at as "createdAt",
        dp.updated_at as "updatedAt"
      FROM doctor_profiles dp
      WHERE dp.user_id::text = $1 OR dp.id::text = $1`,
      [targetDoctorId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Doctor profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: res.rows[0],
    });
  } catch (err: any) {
    console.error('Error fetching doctor profile:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch doctor profile' },
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
    const pool = getPgPool();

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.fullName !== undefined) {
      updates.push(`full_name = $${idx++}`);
      values.push(body.fullName);
    }
    if (body.phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(body.phone);
    }
    if (body.specialization !== undefined) {
      updates.push(`specialization = $${idx++}`);
      values.push(body.specialization);
    }
    if (body.clinicName !== undefined) {
      updates.push(`clinic_name = $${idx++}`);
      values.push(body.clinicName);
    }
    if (body.clinicAddress !== undefined) {
      updates.push(`clinic_address = $${idx++}`);
      values.push(body.clinicAddress);
    }
    if (body.yearsOfExperience !== undefined) {
      updates.push(`years_of_experience = $${idx++}`);
      values.push(body.yearsOfExperience);
    }
    if (body.bio !== undefined) {
      updates.push(`bio = $${idx++}`);
      values.push(body.bio);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = now()`);
    values.push(user.id);

    const query = `
      UPDATE doctor_profiles 
      SET ${updates.join(', ')} 
      WHERE user_id = $${idx}
      RETURNING *;
    `;

    const res = await pool.query(query, values);
    return NextResponse.json({
      success: true,
      profile: res.rows[0],
    });
  } catch (err: any) {
    console.error('Error updating doctor profile:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update doctor profile' },
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
    const pool = getPgPool();

    const fullName = body.fullName || user.user_metadata?.full_name || 'Dr. Medical Professional';
    const email = body.email || user.email || '';
    const phone = body.phone || '';
    const specialization = body.specialization || 'General Medicine';
    const medicalRegistrationNumber = body.medicalRegistrationNumber || 'REG-' + Math.floor(10000 + Math.random() * 90000);
    const registrationCountry = body.registrationCountry || 'India';
    const clinicName = body.clinicName || 'Health Center';
    const clinicAddress = body.clinicAddress || '';
    const yearsOfExperience = Number(body.yearsOfExperience) || 5;
    const bio = body.bio || '';
    const verificationStatus = body.verificationStatus || 'pending';

    const res = await pool.query(
      `INSERT INTO doctor_profiles (
        user_id, full_name, email, phone, specialization, medical_registration_number,
        registration_country, clinic_name, clinic_address, years_of_experience, bio, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        specialization = EXCLUDED.specialization,
        medical_registration_number = EXCLUDED.medical_registration_number,
        clinic_name = EXCLUDED.clinic_name,
        years_of_experience = EXCLUDED.years_of_experience,
        verification_status = EXCLUDED.verification_status,
        updated_at = now()
      RETURNING 
        id,
        user_id as "userId",
        full_name as "fullName",
        email,
        phone,
        specialization,
        medical_registration_number as "medicalRegistrationNumber",
        registration_country as "registrationCountry",
        clinic_name as "clinicName",
        clinic_address as "clinicAddress",
        years_of_experience as "yearsOfExperience",
        bio,
        profile_photo_path as "profilePhotoPath",
        verification_status as "verificationStatus",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        user.id, fullName, email, phone, specialization, medicalRegistrationNumber,
        registrationCountry, clinicName, clinicAddress, yearsOfExperience, bio, verificationStatus
      ]
    );

    return NextResponse.json({
      success: true,
      profile: res.rows[0],
    });
  } catch (err: any) {
    console.error('Error creating doctor profile:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create doctor profile' },
      { status: 500 }
    );
  }
}
