import { getOllamaStatus, generateDynamicHealthSummary } from '../src/lib/ai/ollama.js';

async function test() {
  console.log('Testing Ollama status...');
  const status = await getOllamaStatus();
  console.log('Status result:', status);

  if (!status.available) {
    console.error('Ollama is not available!');
    process.exit(1);
  }

  console.log('Testing generateDynamicHealthSummary with sample records...');
  const res = await generateDynamicHealthSummary({
    patientName: 'Test Patient',
    prescriptions: [
      { drug_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed_date: '2026-01-10' }
    ],
    labResults: [
      { test_name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL', test_date: '2026-03-01', reference_range_low: 70, reference_range_high: 99 },
      { test_name: 'HbA1c', value: 6.8, unit: '%', test_date: '2026-03-01', reference_range_low: 4.0, reference_range_high: 5.6 }
    ],
    vaccinations: [],
    riskFlags: [
      { rule_triggered: 'ADA Fasting Glucose Diagnostic Threshold', threshold_description: 'Fasting glucose >= 126 mg/dL meets criterion for diabetes', severity: 'high', test_name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL' }
    ]
  });

  console.log('Model used:', res.modelName);
  console.log('Generated Summary Overview:');
  console.log(res.summary.overview);
  console.log('Trends count:', res.summary.trends.length);
  console.log('Trends:', JSON.stringify(res.summary.trends, null, 2));
  console.log('Observations:', res.summary.observations);
  console.log('Suggested questions for doctor:', res.summary.suggestedQuestionsForDoctor);
  console.log('SUCCESS! Real Ollama + Qwen generated summary verified.');
}

test().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
