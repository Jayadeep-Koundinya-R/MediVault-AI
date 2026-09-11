import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = 'https://ucdrhwdyzoateiqlybvh.supabase.co';
const supabaseAnonKey = 'sb_publishable_wnQzeGBtymVm9XuqmPLjAA_LUzO1QZJ';
const connectionString = 'postgresql://postgres.ucdrhwdyzoateiqlybvh:arisearo7%40123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';
const BASE_URL = 'http://localhost:5173';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function getOrCreateUser(email, password, fullName, accountType = 'patient') {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const signUpRes = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    if (signUpRes.error) {
      throw new Error(`Failed to sign up ${email}: ${signUpRes.error.message}`);
    }

    data = {
      user: signUpRes.data.user,
      session: signUpRes.data.session,
    };
  }

  // Ensure profile has correct account_type
  await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      account_type: accountType,
    });

  let token = data?.session?.access_token;
  if (!token) {
    // Retry login if signup didn't return session immediately
    const loginRes = await supabase.auth.signInWithPassword({ email, password });
    token = loginRes.data?.session?.access_token;
  }

  return { user: data.user, token };
}

async function runTests() {
  console.log('====================================================');
  console.log('  HEALTHVAULT 2.0 END-TO-END ACCEPTANCE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Prepare Test Accounts
    // -------------------------------------------------------------
    console.log('Step 1: Authenticating Test Accounts...');

    const patient = await getOrCreateUser(
      'patient.v2test@healthvault.local',
      'PatientVault2026!',
      'Aditi Sen',
      'patient'
    );
    console.log(`- Patient authenticated: ${patient.user.id}`);

    const doctorA = await getOrCreateUser(
      'doctorA.v2test@healthvault.local',
      'DoctorVault2026!',
      'Dr. Ananya Rao',
      'doctor'
    );
    console.log(`- Doctor A authenticated: ${doctorA.user.id}`);

    const doctorB = await getOrCreateUser(
      'doctorB.v2test@healthvault.local',
      'DoctorVault2026!',
      'Dr. Vikram Seth',
      'doctor'
    );
    console.log(`- Doctor B authenticated: ${doctorB.user.id}`);

    // Clean up test relations for idempotent test runs using pool
    await pool.query(
      `DELETE FROM doctor_patient_relationships 
       WHERE doctor_id IN ($1, $2) OR patient_id = $3;`,
      [doctorA.user.id, doctorB.user.id, patient.user.id]
    );
    await pool.query(
      `DELETE FROM family_relationships 
       WHERE owner_user_id = $1 OR member_user_id = $1;`,
      [patient.user.id]
    );
    await pool.query(
      `DELETE FROM conversations 
       WHERE patient_id = $1 OR doctor_id IN ($2, $3);`,
      [patient.user.id, doctorA.user.id, doctorB.user.id]
    );
    await pool.query(
      `DELETE FROM notifications 
       WHERE user_id IN ($1, $2, $3);`,
      [patient.user.id, doctorA.user.id, doctorB.user.id]
    );
    await pool.query(
      `DELETE FROM access_logs 
       WHERE patient_user_id = $1 OR actor_user_id IN ($2, $3);`,
      [patient.user.id, doctorA.user.id, doctorB.user.id]
    );
    await pool.query(
      `DELETE FROM doctor_reviews 
       WHERE patient_id = $1 OR doctor_id IN ($2, $3);`,
      [patient.user.id, doctorA.user.id, doctorB.user.id]
    );
    await pool.query(
      `DELETE FROM summaries 
       WHERE user_id = $1;`,
      [patient.user.id]
    );

    // Seed patient records & summary
    const seedRes = await fetch(`${BASE_URL}/api/demo/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
    });
    const seedJson = await seedRes.json();
    assert(seedJson.success, 'Patient health records seeded successfully');

    // Seed baseline summary for patient
    const sumIns = await pool.query(
      `INSERT INTO summaries (user_id, summary_text, trend_notes, model_name, model_provider)
       VALUES ($1, $2, $3, 'qwen2.5:7b', 'ollama')
       RETURNING id;`,
      [
        patient.user.id,
        'Active Health Overview: Stable glycemic control under current medication regimen. Fasting glucose at 128 mg/dL requires periodic re-evaluation.',
        JSON.stringify(['Fasting blood glucose elevated at 128 mg/dL', 'HbA1c borderline at 6.8%']),
      ]
    );
    const seedSumId = sumIns.rows[0]?.id;
    console.log(`- Seeded initial summary for patient: ${seedSumId}`);

    // -------------------------------------------------------------
    // Step 2: Doctor Profiles & Verification
    // -------------------------------------------------------------
    console.log('\nStep 2: Doctor Profile & Verification System...');

    // Create Doctor A profile
    const docAProfRes = await fetch(`${BASE_URL}/api/doctors/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorA.token}`,
      },
      body: JSON.stringify({
        fullName: 'Dr. Ananya Rao',
        specialization: 'Cardiologist',
        medicalRegistrationNumber: 'MCI-19948-KA',
        registrationCountry: 'India',
        clinicName: 'Apollo Health City',
        yearsOfExperience: 12,
        verificationStatus: 'verified',
      }),
    });
    const docAProfJson = await docAProfRes.json();
    assert(docAProfJson.success, 'Doctor A profile registered via API');

    // Create Doctor B profile (unverified)
    const docBProfRes = await fetch(`${BASE_URL}/api/doctors/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorB.token}`,
      },
      body: JSON.stringify({
        fullName: 'Dr. Vikram Seth',
        specialization: 'Neurologist',
        medicalRegistrationNumber: 'MCI-88219-DL',
        registrationCountry: 'India',
        clinicName: 'Max Healthcare',
        yearsOfExperience: 8,
        verificationStatus: 'pending',
      }),
    });
    const docBProfJson = await docBProfRes.json();
    assert(docBProfJson.success, 'Doctor B profile registered via API');

    // Search doctors from patient perspective
    const searchRes = await fetch(`${BASE_URL}/api/doctors/search?q=Ananya`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const searchJson = await searchRes.json();
    assert(searchJson.success && searchJson.doctors?.length > 0, 'Patient can search verified doctor directory');
    assert(searchJson.doctors?.[0]?.verificationStatus === 'verified', 'Doctor A displays "Verified Doctor ✓" status');

    // -------------------------------------------------------------
    // Step 3: Doctor Connection Request & Acceptance
    // -------------------------------------------------------------
    console.log('\nStep 3: Doctor-Patient Connection Workflow...');

    // Patient requests connection with Doctor A
    const reqRes = await fetch(`${BASE_URL}/api/doctor/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({ doctorId: doctorA.user.id }),
    });
    const reqJson = await reqRes.json();
    if (!reqJson.success) {
      console.log('DEBUG reqRes status:', reqRes.status, 'reqJson:', reqJson);
    }
    assert(reqJson.success, 'Patient successfully sent connection request to Doctor A');
    const relationshipId = reqJson.relationshipId || reqJson.relationship?.id;

    // Doctor A views pending requests
    const docRequestsRes = await fetch(`${BASE_URL}/api/doctor/requests`, {
      headers: { Authorization: `Bearer ${doctorA.token}` },
    });
    const docRequestsJson = await docRequestsRes.json();
    const pendingFound = docRequestsJson.requests?.some(r => r.id === relationshipId);
    assert(pendingFound, 'Doctor A sees pending connection request from Patient');

    // Doctor A accepts the connection request
    const acceptRes = await fetch(`${BASE_URL}/api/doctor/requests`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorA.token}`,
      },
      body: JSON.stringify({ relationshipId, status: 'accepted' }),
    });
    const acceptJson = await acceptRes.json();
    assert(acceptJson.success, 'Doctor A accepted connection request');

    // -------------------------------------------------------------
    // Step 4: Access Isolation (Doctor B cannot see Patient)
    // -------------------------------------------------------------
    console.log('\nStep 4: Strict Access Isolation Check...');

    // Doctor B queries /api/doctor/patients
    const docBPatientsRes = await fetch(`${BASE_URL}/api/doctor/patients`, {
      headers: { Authorization: `Bearer ${doctorB.token}` },
    });
    const docBPatientsJson = await docBPatientsRes.json();
    const leaked = docBPatientsJson.patients?.some(p => p.patientId === patient.user.id);
    assert(!leaked, 'Doctor B CANNOT see Patient in their patient list');

    // Doctor B attempts direct access to Patient records
    const docBAccessRes = await fetch(`${BASE_URL}/api/doctor/patients/${patient.user.id}`, {
      headers: { Authorization: `Bearer ${doctorB.token}` },
    });
    assert(docBAccessRes.status === 403 || docBAccessRes.status === 404, 'Doctor B blocked with 403/404 when querying unpermitted patient records');

    // -------------------------------------------------------------
    // Step 5: Granular Sharing Permissions & Access Logging
    // -------------------------------------------------------------
    console.log('\nStep 5: Granular Sharing Permissions & Audit Logging...');

    // Patient configures permissions: shareSummary=true, sharePrescriptions=true, shareLabs=false
    const permRes = await fetch(`${BASE_URL}/api/doctor/requests`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({
        relationshipId,
        permissions: {
          shareSummary: true,
          sharePrescriptions: true,
          shareLabs: false,
          shareVaccinations: false,
          shareOriginalDocuments: false,
        },
      }),
    });
    const permJson = await permRes.json();
    assert(permJson.success, 'Patient updated privacy permissions (shareLabs=false, sharePrescriptions=true)');

    // Doctor A fetches patient details
    const docAFetchRes = await fetch(`${BASE_URL}/api/doctor/patients/${patient.user.id}`, {
      headers: { Authorization: `Bearer ${doctorA.token}` },
    });
    const docAFetchJson = await docAFetchRes.json();
    assert(docAFetchJson.success, 'Doctor A successfully retrieved permitted patient profile');
    assert(docAFetchJson.patient.summary !== null, 'Doctor A can view Summary (shareSummary=true)');
    assert(docAFetchJson.patient.prescriptions?.length > 0, 'Doctor A can view Prescriptions (sharePrescriptions=true)');
    assert(!docAFetchJson.patient.labs || docAFetchJson.patient.labs.length === 0, 'Doctor A CANNOT view Labs (shareLabs=false enforced)');

    // Verify Access Audit Log was recorded
    const accessAuditRes = await fetch(`${BASE_URL}/api/settings/access`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const accessAuditJson = await accessAuditRes.json();
    assert(accessAuditJson.success, 'Patient can access access & audit logs');
    assert(accessAuditJson.logs?.length > 0, 'Audit log accurately captured Doctor A clinical access');

    // -------------------------------------------------------------
    // Step 6: Doctor Review & "Doctor Reviewed ★" Star Badge
    // -------------------------------------------------------------
    console.log('\nStep 6: Doctor Review & "Doctor Reviewed ★" Star Badge...');

    // Get current summary ID
    const summaryRes = await fetch(`${BASE_URL}/api/ai/summary`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const summaryJson = await summaryRes.json();
    const summaryId = summaryJson.summary?.id || summaryJson.data?.summary?.id || seedSum?.id;
    assert(Boolean(summaryId), `Active health summary found (ID: ${summaryId})`);

    // Doctor A submits review
    const reviewText = 'Clinically evaluated: Lipid parameters require continuous monitoring. Prescriptions confirmed.';
    const reviewRes = await fetch(`${BASE_URL}/api/doctor/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorA.token}`,
      },
      body: JSON.stringify({
        patientId: patient.user.id,
        summaryId,
        reviewText,
      }),
    });
    const reviewJson = await reviewRes.json();
    assert(reviewJson.success, 'Doctor A submitted clinical review with status="reviewed"');

    // Patient checks summary: must display "Doctor Reviewed ★"
    const verifiedSummaryRes = await fetch(`${BASE_URL}/api/ai/summary`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const verifiedSummaryJson = await verifiedSummaryRes.json();
    const targetSummary = verifiedSummaryJson.summary || verifiedSummaryJson.data?.summary;
    assert(targetSummary?.isDoctorReviewed === true, 'Summary reflects "Doctor Reviewed ★" badge (isDoctorReviewed=true)');
    assert(targetSummary?.doctorReviews?.length > 0, 'Summary includes verified doctor review note');

    // Check patient received notification for doctor review
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const notifJson = await notifRes.json();
    const reviewNotif = notifJson.notifications?.find(n => n.type === 'doctor_review');
    assert(Boolean(reviewNotif), 'Patient received instant in-app notification of Doctor Review');

    // -------------------------------------------------------------
    // Step 7: 1-to-1 Patient ↔ Doctor Chat
    // -------------------------------------------------------------
    console.log('\nStep 7: 1-to-1 Patient ↔ Doctor Chat & Summary Attachments...');

    // Create / get conversation
    const convRes = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({ doctorId: doctorA.user.id }),
    });
    const convJson = await convRes.json();
    assert(convJson.success, '1-to-1 Conversation established between Patient and Doctor A');
    const conversationId = convJson.conversation.id;

    // Patient sends message with attached summary card
    const sendMsgRes = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({
        messageText: 'Hello Dr. Ananya, sharing my latest health summary for your clinical opinion.',
        sharedSummaryId: summaryId,
      }),
    });
    const sendMsgJson = await sendMsgRes.json();
    assert(sendMsgJson.success, 'Message with attached summary card sent successfully');

    // Doctor A retrieves messages
    const docMsgsRes = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${doctorA.token}` },
    });
    const docMsgsJson = await docMsgsRes.json();
    assert(docMsgsJson.success && docMsgsJson.messages?.length > 0, 'Doctor A fetched messages from conversation');
    assert(docMsgsJson.messages[0].sharedSummary?.id === summaryId, 'Attached health summary preview card rendered in conversation');

    // Doctor A marks message as read
    const readRes = await fetch(`${BASE_URL}/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorA.token}` },
    });
    const readJson = await readRes.json();
    assert(readJson.success, 'Doctor A marked message as read (read_at updated)');

    // Doctor B forbidden from this conversation
    const docBConvRes = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${doctorB.token}` },
    });
    assert(docBConvRes.status === 403 || docBConvRes.status === 404, 'Doctor B strictly forbidden (403/404) from reading private conversation');

    // -------------------------------------------------------------
    // Step 8: Family Health Profiles & Access Matrix
    // -------------------------------------------------------------
    console.log('\nStep 8: Family Health Profiles & Permissions Matrix...');

    // Patient adds family member
    const addFamRes = await fetch(`${BASE_URL}/api/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({
        memberName: 'Sunita Sen',
        relationshipType: 'Mother',
      }),
    });
    const addFamJson = await addFamRes.json();
    assert(addFamJson.success, 'Family member "Sunita Sen" profile created');
    const familyId = addFamJson.relationship?.id || addFamJson.relationshipId;

    // Update family permissions: shareSummary=true, shareFlags=true, shareLabs=false
    const updateFamPermRes = await fetch(`${BASE_URL}/api/family/${familyId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({
        shareSummary: true,
        shareFlags: true,
        shareLabs: false,
        sharePrescriptions: false,
      }),
    });
    const updateFamPermJson = await updateFamPermRes.json();
    assert(updateFamPermJson.success, 'Configured granular permissions for Family Member');

    // Query family member detail
    const famDetailRes = await fetch(`${BASE_URL}/api/family/${familyId}`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    const famDetailJson = await famDetailRes.json();
    assert(famDetailJson.success, 'Retrieved family member detail view with active permissions');

    // Revoke family access
    const revokeFamRes = await fetch(`${BASE_URL}/api/family/${familyId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patient.token}`,
      },
      body: JSON.stringify({ revoke: true }),
    });
    const revokeFamJson = await revokeFamRes.json();
    assert(revokeFamJson.success, 'Family member access successfully revoked');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    await pool.end();

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('ALL HEALTHVAULT 2.0 ACCEPTANCE TESTS PASSED!\n');
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

runTests();
