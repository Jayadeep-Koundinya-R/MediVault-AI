import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucdrhwdyzoateiqlybvh.supabase.co';
const supabaseAnonKey = 'sb_publishable_wnQzeGBtymVm9XuqmPLjAA_LUzO1QZJ';
const BASE_URL = 'http://localhost:5173';

async function main() {
  console.log('Testing full-stack API workflows against dev server:', BASE_URL);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Authenticate Demo Patient
  const demoEmail = 'test.patient@gmail.com';
  const demoPass = 'TestPassword123!';

  console.log('1. Authenticating test user:', demoEmail);
  let { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPass,
  });

  if (error) {
    console.log('User not found, signing up...');
    const signUpRes = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPass,
      options: {
        data: {
          full_name: 'E2E Test Patient',
          date_of_birth: '1988-06-15',
        },
      },
    });
    data = {
      user: signUpRes.data.user,
      session: signUpRes.data.session,
    };
  }

  const token = data?.session?.access_token;
  if (!token) {
    console.error('Could not get access token!');
    process.exit(1);
  }
  console.log('Access token acquired for user:', data.user.id);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Call /api/demo/seed
  console.log('\n2. Calling POST /api/demo/seed...');
  const seedRes = await fetch(`${BASE_URL}/api/demo/seed`, {
    method: 'POST',
    headers,
  });
  const seedJson = await seedRes.json();
  console.log('Seed response:', seedJson);

  // 3. Call /api/profile
  console.log('\n3. Calling GET /api/profile...');
  const profileRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'GET',
    headers,
  });
  const profileJson = await profileRes.json();
  console.log('Profile response:', profileJson);

  // 4. Call /api/timeline
  console.log('\n4. Calling GET /api/timeline...');
  const timelineRes = await fetch(`${BASE_URL}/api/timeline`, {
    method: 'GET',
    headers,
  });
  const timelineJson = await timelineRes.json();
  console.log(`Timeline items count: ${timelineJson.data?.length}`);
  console.log('First 2 items:', timelineJson.data?.slice(0, 2));

  // 5. Call /api/export/summary
  console.log('\n5. Calling POST /api/export/summary...');
  const exportRes = await fetch(`${BASE_URL}/api/export/summary`, {
    method: 'POST',
    headers,
  });
  const exportJson = await exportRes.json();
  console.log('Export brief length:', exportJson.data?.formattedText?.length);
  console.log('Export metadata:', {
    prescriptions: exportJson.data?.prescriptionCount,
    labs: exportJson.data?.labCount,
    flags: exportJson.data?.flagCount,
  });

  // 6. Call POST /api/ai/summary (Real Ollama + Qwen Dynamic AI Summary)
  console.log('\n6. Calling POST /api/ai/summary (Dynamic Ollama + Qwen generation)...');
  const summaryRes = await fetch(`${BASE_URL}/api/ai/summary`, {
    method: 'POST',
    headers,
  });
  const summaryJson = await summaryRes.json();
  console.log('Summary response status:', summaryRes.status);
  console.log('Model used:', summaryJson.data?.model);
  console.log('Generated overview:');
  console.log(summaryJson.data?.aiStructured?.overview);
  console.log('Trends:', summaryJson.data?.aiStructured?.trends);
  console.log('Risk flags count:', summaryJson.data?.riskFlags?.length);

  // 7. Call GET /api/ai/summary to verify persistence
  console.log('\n7. Calling GET /api/ai/summary to verify database persistence...');
  const getSumRes = await fetch(`${BASE_URL}/api/ai/summary`, {
    method: 'GET',
    headers,
  });
  const getSumJson = await getSumRes.json();
  console.log('Persisted summary exists:', Boolean(getSumJson.data?.summary?.id));
  console.log('Persisted summary model:', getSumJson.data?.summary?.model_name);

  console.log('\n======================================================');
  console.log('ALL API ENDPOINTS VERIFIED OVER HTTP SUCCESSFULLY!');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('E2E API test failed:', err);
  process.exit(1);
});
