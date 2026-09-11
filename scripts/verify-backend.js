import pg from 'pg';
import { getOllamaStatus, generateDynamicHealthSummary } from '../src/lib/ai/ollama.js';
import { evaluateLabResults } from '../src/lib/health/thresholds.js';
import { HealthSummarySchema } from '../src/lib/ai/schemas.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ucdrhwdyzoateiqlybvh:arisearo7%40123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function runVerification() {
  console.log('================================================================');
  console.log('HEALTHVAULT FULL-STACK BACKEND & AI VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, detail = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       ${detail}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Error: ${detail}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Supabase Database Connectivity & Schema
  // -------------------------------------------------------------
  console.log('\n--- 1. Database Connection & Schema Verification ---');
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const expectedTables = [
    'documents',
    'health_consents',
    'lab_results',
    'prescriptions',
    'profiles',
    'risk_flags',
    'summaries',
    'vaccinations',
  ];

  const tableQuery = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  const actualTables = tableQuery.rows.map((r) => r.table_name);

  for (const t of expectedTables) {
    assert(actualTables.includes(t), `Table 'public.${t}' exists`, `Found: ${actualTables.includes(t)}`);
  }

  // Storage Bucket Verification
  const bucketQuery = await client.query(`
    SELECT id, name, public, file_size_limit 
    FROM storage.buckets 
    WHERE id = 'health-documents';
  `);
  assert(bucketQuery.rows.length === 1, "Storage bucket 'health-documents' provisioned");
  assert(bucketQuery.rows[0]?.public === false, "Storage bucket 'health-documents' is strictly PRIVATE (public = false)");

  // -------------------------------------------------------------
  // TEST 2: Row Level Security (RLS) Status
  // -------------------------------------------------------------
  console.log('\n--- 2. Row Level Security (RLS) Policies ---');
  const rlsQuery = await client.query(`
    SELECT relname as table_name, relrowsecurity as rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_namespace.nspname = 'public' AND relkind = 'r'
    AND relname = ANY($1::text[]);
  `, [expectedTables]);

  for (const row of rlsQuery.rows) {
    assert(row.rls_enabled === true, `RLS enabled on '${row.table_name}'`);
  }

  // -------------------------------------------------------------
  // TEST 3: Deterministic Clinical Threshold Engine
  // -------------------------------------------------------------
  console.log('\n--- 3. Deterministic Clinical Threshold Engine ---');

  const testLabBatch = [
    { id: '1', test_name: 'Fasting Blood Sugar', value: 132, unit: 'mg/dL', test_date: '2026-03-01' },
    { id: '2', test_name: 'Fasting Blood Sugar', value: 112, unit: 'mg/dL', test_date: '2026-03-01' },
    { id: '3', test_name: 'Fasting Blood Sugar', value: 88, unit: 'mg/dL', test_date: '2026-03-01' },
    { id: '4', test_name: 'HbA1c', value: 7.1, unit: '%', test_date: '2026-03-01' },
    { id: '5', test_name: 'LDL Cholesterol', value: 165, unit: 'mg/dL', test_date: '2026-03-01' },
    { id: '6', test_name: 'eGFR', value: 48, unit: 'mL/min/1.73m2', test_date: '2026-03-01' },
  ];

  const flags = evaluateLabResults(testLabBatch);
  assert(flags.length === 5, 'Evaluated 6 lab values into exactly 5 expected threshold flags');

  const fbsHigh = flags.find((f) => f.lab_result_id === '1');
  assert(fbsHigh?.severity === 'high' && fbsHigh.rule_triggered.includes('ADA'), 'FBS 132 mg/dL triggers ADA High severity diabetic threshold flag');

  const fbsMod = flags.find((f) => f.lab_result_id === '2');
  assert(fbsMod?.severity === 'moderate' && fbsMod.rule_triggered.includes('Prediabetes'), 'FBS 112 mg/dL triggers ADA Moderate prediabetes flag');

  const fbsNorm = flags.find((f) => f.lab_result_id === '3');
  assert(!fbsNorm, 'FBS 88 mg/dL normal reading produces zero flags');

  const hba1cHigh = flags.find((f) => f.lab_result_id === '4');
  assert(hba1cHigh?.severity === 'high', 'HbA1c 7.1% triggers High severity flag');

  const egfrHigh = flags.find((f) => f.lab_result_id === '6');
  assert(egfrHigh?.severity === 'high' && egfrHigh.rule_triggered.includes('KDIGO'), 'eGFR 48 triggers KDIGO impaired kidney function flag');

  // -------------------------------------------------------------
  // TEST 4: Local Ollama & Qwen Diagnostic Health Check
  // -------------------------------------------------------------
  console.log('\n--- 4. Local Ollama & Qwen Diagnostics ---');
  const ollamaStatus = await getOllamaStatus();
  assert(ollamaStatus.available === true, 'Ollama service is active and responsive on http://localhost:11434');
  assert(ollamaStatus.model.includes('qwen'), `Active detected model: '${ollamaStatus.model}'`);
  console.log('       Available local models:', ollamaStatus.availableModels);

  // -------------------------------------------------------------
  // TEST 5: Real Dynamic AI Summarization with Zod Schema Validation
  // -------------------------------------------------------------
  console.log('\n--- 5. Dynamic AI Summarization (Real Inference) ---');
  console.log('       Executing inference against model:', ollamaStatus.model);

  const initialClinicalContext = {
    patientName: 'Rahul Sharma',
    prescriptions: [
      { drug_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed_date: '2026-03-01' },
      { drug_name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', prescribed_date: '2026-03-01' },
    ],
    labResults: [
      { test_name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL', test_date: '2026-03-01', reference_range_low: 70, reference_range_high: 99 },
      { test_name: 'HbA1c', value: 6.8, unit: '%', test_date: '2026-03-01', reference_range_low: 4.0, reference_range_high: 5.6 },
      { test_name: 'LDL Cholesterol', value: 142, unit: 'mg/dL', test_date: '2026-02-15', reference_range_low: 0, reference_range_high: 100 },
    ],
    vaccinations: [
      { vaccine_name: 'Tetanus Toxoid', dose_number: 1, date_administered: '2025-01-20' },
    ],
    riskFlags: [
      { rule_triggered: 'ADA Fasting Glucose Diagnostic Threshold', threshold_description: 'FBS >= 126 mg/dL', severity: 'high', test_name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL' },
      { rule_triggered: 'ADA HbA1c Diabetes Threshold', threshold_description: 'HbA1c >= 6.5%', severity: 'high', test_name: 'HbA1c', value: 6.8, unit: '%' },
    ],
  };

  const summary1 = await generateDynamicHealthSummary(initialClinicalContext);
  assert(summary1.summary.overview.length > 20, 'Dynamic AI summary overview generated');
  console.log('       Overview snippet:', summary1.summary.overview.substring(0, 120) + '...');
  assert(summary1.summary.trends.length > 0, `Generated ${summary1.summary.trends.length} dynamic longitudinal trend item(s)`);
  assert(summary1.summary.observations.length > 0, `Generated ${summary1.summary.observations.length} clinical observation(s)`);
  assert(summary1.summary.suggestedQuestionsForDoctor.length > 0, `Generated ${summary1.summary.suggestedQuestionsForDoctor.length} physician question(s)`);
  assert(summary1.summary.disclaimer.includes('Clinical disclaimer'), 'Contains required non-diagnostic clinical disclaimer');

  // Verify Zod Validation
  const zodValidation = HealthSummarySchema.safeParse(summary1.summary);
  assert(zodValidation.success === true, 'Summary strictly validates against HealthSummarySchema');

  // -------------------------------------------------------------
  // TEST 6: Non-Static Dynamic Variation Test
  // -------------------------------------------------------------
  console.log('\n--- 6. Verifying AI Is Dynamic (Not Hardcoded) ---');
  // Pass markedly different medical data (e.g. Asthma patient with Prednisone and Normal Glucose)
  const modifiedClinicalContext = {
    patientName: 'Priya Mehta',
    prescriptions: [
      { drug_name: 'Budecort Inhaler', dosage: '200mcg', frequency: 'Twice daily', prescribed_date: '2026-03-05' },
    ],
    labResults: [
      { test_name: 'Fasting Blood Sugar', value: 85, unit: 'mg/dL', test_date: '2026-03-05', reference_range_low: 70, reference_range_high: 99 },
      { test_name: 'Absolute Eosinophil Count', value: 650, unit: 'cells/mcL', test_date: '2026-03-05', reference_range_low: 20, reference_range_high: 500 },
    ],
    vaccinations: [],
    riskFlags: [
      { rule_triggered: 'Elevated Eosinophils', threshold_description: 'AEC > 500 cells/mcL', severity: 'moderate', test_name: 'Absolute Eosinophil Count', value: 650, unit: 'cells/mcL' },
    ],
  };

  const summary2 = await generateDynamicHealthSummary(modifiedClinicalContext);
  assert(summary2.summary.overview !== summary1.summary.overview, 'Different patient data produces completely distinct AI summary');
  assert(
    summary2.summary.overview.toLowerCase().includes('eosinophil') ||
    summary2.summary.overview.toLowerCase().includes('inhaler') ||
    summary2.summary.overview.toLowerCase().includes('priya') ||
    summary2.summary.overview.toLowerCase().includes('budecort'),
    'Summary dynamically synthesized context from second patient (mentions Eosinophil/Inhaler/Budecort)'
  );
  console.log('       Second overview snippet:', summary2.summary.overview.substring(0, 120) + '...');

  await client.end();

  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification failed with unhandled error:', err);
  process.exit(1);
});
