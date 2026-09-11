export interface LabResultInput {
  id?: string;
  test_name: string;
  value: number;
  unit: string;
  reference_range_low?: number | null;
  reference_range_high?: number | null;
  test_date: string;
}

export interface ClinicalRiskFlag {
  id?: string;
  lab_result_id?: string;
  rule_triggered: string;
  threshold_description: string;
  severity: 'info' | 'moderate' | 'high';
  flagged_at: string;
  test_name: string;
  value: number;
  unit: string;
  test_date: string;
}

/**
 * Deterministic Clinical Threshold Engine
 * Evaluates individual lab results against established clinical guidelines (ADA, AHA/ACC, KDIGO)
 * AI NEVER decides these threshold flags. They are strictly rule-based.
 */
export function evaluateLabResult(result: LabResultInput): ClinicalRiskFlag | null {
  const name = result.test_name.toLowerCase().trim();
  const val = Number(result.value);

  if (isNaN(val)) return null;

  // 1. Fasting Blood Sugar / Fasting Glucose
  if (name.includes('fasting glucose') || name.includes('fasting blood sugar') || name.includes('fbs')) {
    if (val >= 126) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'ADA Fasting Glucose Diagnostic Threshold',
        threshold_description: 'Fasting blood glucose ≥ 126 mg/dL meets the American Diabetes Association criterion for diabetes. Requires physician confirmation.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val >= 100) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'ADA Impaired Fasting Glucose (Prediabetes)',
        threshold_description: 'Fasting glucose between 100-125 mg/dL indicates impaired fasting glucose (prediabetes). Dietary review and follow-up recommended.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val < 70) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'Clinical Hypoglycemia Alert',
        threshold_description: 'Blood glucose < 70 mg/dL constitutes clinical hypoglycemia requiring fast-acting glucose and medical review.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 2. Post-Prandial Blood Sugar / Random Glucose
  if (name.includes('post prandial') || name.includes('ppbs') || name.includes('random blood sugar')) {
    if (val >= 200) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'ADA Post-Prandial Hyperglycemia Threshold',
        threshold_description: 'Post-prandial blood glucose ≥ 200 mg/dL is indicative of diabetes per ADA guidelines.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val >= 140) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'Impaired Glucose Tolerance',
        threshold_description: 'Post-prandial blood glucose between 140-199 mg/dL indicates impaired glucose tolerance.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 3. HbA1c (Glycated Hemoglobin)
  if (name.includes('hba1c') || name.includes('glycated hemoglobin') || name.includes('a1c')) {
    if (val >= 6.5) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'ADA HbA1c Diabetes Threshold',
        threshold_description: 'HbA1c ≥ 6.5% confirms persistent glycemic elevation consistent with diabetes mellitus.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val >= 5.7) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'ADA Prediabetes HbA1c Range',
        threshold_description: 'HbA1c between 5.7% and 6.4% indicates prediabetes status with heightened cardiovascular risk.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 4. LDL Cholesterol
  if (name.includes('ldl') || name.includes('low-density')) {
    if (val >= 160) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'AHA/ACC Marked Hypercholesterolemia',
        threshold_description: 'LDL Cholesterol ≥ 160 mg/dL is categorized as high atherogenic cardiovascular risk.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val > 100) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'AHA Suboptimal LDL Target',
        threshold_description: 'LDL Cholesterol > 100 mg/dL exceeds optimal cardioprotective targets for adult cardiovascular health.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 5. Total Cholesterol
  if (name.includes('total cholesterol') || (name.includes('cholesterol') && !name.includes('hdl') && !name.includes('ldl'))) {
    if (val >= 240) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'AHA Elevated Total Cholesterol',
        threshold_description: 'Total cholesterol ≥ 240 mg/dL is classified as high and elevates atherosclerotic risk.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val >= 200) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'Borderline High Total Cholesterol',
        threshold_description: 'Total cholesterol between 200-239 mg/dL is borderline high.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 6. Triglycerides
  if (name.includes('triglyceride')) {
    if (val >= 200) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'High Triglycerides',
        threshold_description: 'Triglycerides ≥ 200 mg/dL represents hypertriglyceridemia associated with metabolic risk.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
    if (val >= 150) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'Borderline High Triglycerides',
        threshold_description: 'Triglycerides between 150-199 mg/dL are borderline elevated.',
        severity: 'moderate',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 7. eGFR (Estimated Glomerular Filtration Rate)
  if (name.includes('egfr') || name.includes('glomerular filtration')) {
    if (val < 60) {
      return {
        lab_result_id: result.id,
        rule_triggered: 'KDIGO Impaired Kidney Function',
        threshold_description: 'eGFR < 60 mL/min/1.73m² indicates impaired filtration efficiency warranting nephrology or clinical evaluation.',
        severity: 'high',
        flagged_at: new Date().toISOString(),
        test_name: result.test_name,
        value: val,
        unit: result.unit,
        test_date: result.test_date,
      };
    }
  }

  // 8. Custom reference range fallback
  if (result.reference_range_high != null && val > result.reference_range_high) {
    return {
      lab_result_id: result.id,
      rule_triggered: 'Above Laboratory Reference Range',
      threshold_description: `${result.test_name} (${val} ${result.unit}) exceeds laboratory reference maximum of ${result.reference_range_high} ${result.unit}.`,
      severity: 'moderate',
      flagged_at: new Date().toISOString(),
      test_name: result.test_name,
      value: val,
      unit: result.unit,
      test_date: result.test_date,
    };
  }

  if (result.reference_range_low != null && val < result.reference_range_low) {
    return {
      lab_result_id: result.id,
      rule_triggered: 'Below Laboratory Reference Range',
      threshold_description: `${result.test_name} (${val} ${result.unit}) is below laboratory reference minimum of ${result.reference_range_low} ${result.unit}.`,
      severity: 'moderate',
      flagged_at: new Date().toISOString(),
      test_name: result.test_name,
      value: val,
      unit: result.unit,
      test_date: result.test_date,
    };
  }

  return null;
}

/**
 * Evaluates a batch of lab results and returns all clinical risk flags
 */
export function evaluateLabResults(results: LabResultInput[]): ClinicalRiskFlag[] {
  const flags: ClinicalRiskFlag[] = [];
  for (const res of results) {
    const flag = evaluateLabResult(res);
    if (flag) {
      flags.push(flag);
    }
  }
  return flags;
}
