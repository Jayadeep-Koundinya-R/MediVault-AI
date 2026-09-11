import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPgPool } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || searchParams.get('query') || '')?.trim();

  try {
    const pool = getPgPool();
    let query = `
      SELECT 
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
        dp.created_at as "createdAt"
      FROM doctor_profiles dp
      WHERE dp.verification_status = 'verified'
    `;
    const params: any[] = [];

    if (q) {
      params.push(`%${q}%`);
      query += ` AND (
        dp.full_name ILIKE $1 
        OR dp.specialization ILIKE $1 
        OR dp.clinic_name ILIKE $1 
        OR dp.medical_registration_number ILIKE $1
      )`;
    }

    query += ` ORDER BY dp.years_of_experience DESC, dp.full_name ASC LIMIT 50`;

    const res = await pool.query(query, params);
    return NextResponse.json({
      success: true,
      doctors: res.rows,
    });
  } catch (err: any) {
    console.error('Error searching doctors:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to search doctors' },
      { status: 500 }
    );
  }
}
