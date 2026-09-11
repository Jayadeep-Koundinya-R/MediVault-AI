import { User, HealthDocument, Prescription, LabResult, Vaccination, AISummary, RiskFlag, TimelineItem } from '../types';

export const currentUser: User = {
  userId: 'usr_rahul_992',
  name: 'Rahul Sharma',
  dateOfBirth: '1984-06-12',
  createdAt: '2025-10-01T09:00:00Z',
};

export const initialDocuments: HealthDocument[] = [
  {
    documentId: 'doc_apollo_lab_0820',
    userId: 'usr_rahul_992',
    type: 'lab_report',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-08-20T11:45:00Z',
    ocrStatus: 'success',
    confidenceScore: 97.4,
    rawOcrText: `APOLLO HOSPITALS ENTERPRISE LTD.
DEPARTMENT OF BIOCHEMISTRY & ENDOCRINOLOGY
PATIENT: Rahul Sharma | AGE/GENDER: 42Y / Male | UHID: APL-992104
REF DOCTOR: Dr. Ananya Sen, MD (Endocrinology) | DATE: 20-AUG-2026

INVESTIGATION RESULTS:
- Fasting Blood Glucose: 138 mg/dL [Ref: 70 - 99 mg/dL] *CRITICAL HIGH*
- HbA1c (Glycosylated Hemoglobin): 7.1 % [Ref: 4.0 - 5.6 %] *HIGH*
- Serum Creatinine: 0.95 mg/dL [Ref: 0.7 - 1.2 mg/dL]
- Total Cholesterol: 194 mg/dL [Ref: < 200 mg/dL]
- Triglycerides: 165 mg/dL [Ref: < 150 mg/dL] *BORDERLINE HIGH*
Verified by: Dr. V. K. Raman, MD Biochemist`,
  },
  {
    documentId: 'doc_apollo_rx_0821',
    userId: 'usr_rahul_992',
    type: 'prescription',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-08-21T14:10:00Z',
    ocrStatus: 'success',
    confidenceScore: 92.1,
    rawOcrText: `DR. ANANYA SEN, MBBS, MD, DM (Endo)
Reg No: MCI-2011/04/1829
Apollo Health City, Jubilee Hills, Hyderabad

Rx for: Rahul Sharma (42 M) | Date: 21/08/2026
Diagnosis: Newly Detected Type 2 Diabetes Mellitus (Uncontrolled Fasting Glucose 138 mg/dL, HbA1c 7.1%)

Medications:
1. Tab. METFORMIN HYDROCHLORIDE 500mg
   Dosage: 1 tablet twice daily with meals (morning and evening)
   Duration: 90 days
2. Tab. GLIMEPIRIDE 1mg
   Dosage: 1 tablet once daily before breakfast
   Duration: 30 days
3. Diet: Strict low-glycemic index, 45 min brisk walking daily.
Review with repeat fasting blood sugar after 4 weeks.`,
  },
  {
    documentId: 'doc_max_lab_0410',
    userId: 'usr_rahul_992',
    type: 'lab_report',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-04-10T10:20:00Z',
    ocrStatus: 'success',
    confidenceScore: 96.0,
    rawOcrText: `MAX HEALTHCARE DIAGNOSTICS
LABORATORY REPORT - METABOLIC PANEL
PATIENT: Rahul Sharma | DATE: 10-APR-2026
- Fasting Blood Sugar: 122 mg/dL [Ref: 70 - 99 mg/dL] *IMPAIRED FASTING GLUCOSE*
- HbA1c: 6.6 % [Ref: 4.0 - 5.6 %] *PRE-DIABETIC RANGE*
- Blood Urea Nitrogen: 14 mg/dL [Ref: 7 - 20 mg/dL]`,
  },
  {
    documentId: 'doc_fortis_lab_0115',
    userId: 'usr_rahul_992',
    type: 'lab_report',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-01-15T09:15:00Z',
    ocrStatus: 'success',
    confidenceScore: 98.2,
    rawOcrText: `FORTIS CLINICAL LABORATORIES
ANNUAL EXECUTIVE HEALTH SCREEN
PATIENT: Rahul Sharma | DATE: 15-JAN-2026
- Fasting Blood Sugar: 110 mg/dL [Ref: 70 - 99 mg/dL] *ELEVATED*
- HbA1c: 6.2 % [Ref: < 5.7 %]
- Serum Uric Acid: 5.4 mg/dL [Ref: 3.5 - 7.2 mg/dL]`,
  },
  {
    documentId: 'doc_vaccine_cowin_1110',
    userId: 'usr_rahul_992',
    type: 'vaccination',
    imageUrl: 'https://images.unsplash.com/photo-1632053001850-2566c7f5397f?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2025-11-10T16:00:00Z',
    ocrStatus: 'success',
    confidenceScore: 99.1,
    rawOcrText: `MINISTRY OF HEALTH & FAMILY WELFARE, GOVT OF INDIA
PROVISIONAL CERTIFICATE FOR COVID-19 VACCINATION
Beneficiary: Rahul Sharma | Age: 41 | Gender: Male
Vaccine Name: COVAXIN (Inactivated SARS-CoV-2)
Dose: Precaution / Booster (Dose 3)
Date of Vaccination: 10 Nov 2025
Vaccination Facility: Manipal Hospital Centre, Bengaluru`,
  },
  {
    documentId: 'doc_manipal_rx_0302',
    userId: 'usr_rahul_992',
    type: 'prescription',
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-03-02T18:00:00Z',
    ocrStatus: 'low_confidence',
    confidenceScore: 78.5,
    rawOcrText: `Dr. Rajesh Mehta - Consultant Physician
Manipal Hospital, Old Airport Road
Patient: Rahul Sharma | Date: 02/03/2026
Rx:
Telmisartan 40mg OD morning
Monitor BP weekly. Low sodium diet.`,
  },
  {
    documentId: 'doc_flu_vaccine_0918',
    userId: 'usr_rahul_992',
    type: 'vaccination',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2025-09-18T10:00:00Z',
    ocrStatus: 'success',
    confidenceScore: 95.8,
    rawOcrText: `APOLLO IMMUNIZATION CLINIC
Influenza Vaccine (Quadrivalent Sub-unit 2025-2026 Season)
Administered: 18-Sep-2025
Next Due Date: 18-Sep-2026 (Annual recommended)`,
  },
];

export const initialPrescriptions: Prescription[] = [
  {
    prescriptionId: 'rx_001',
    documentId: 'doc_apollo_rx_0821',
    userId: 'usr_rahul_992',
    drugName: 'Metformin Hydrochloride',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    prescribedDate: '2026-08-21',
    prescribingDoctor: 'Dr. Ananya Sen, MD (Endocrinology)',
    sourceHospital: 'Apollo Health City, Hyderabad',
    manuallyCorrected: false,
  },
  {
    prescriptionId: 'rx_002',
    documentId: 'doc_apollo_rx_0821',
    userId: 'usr_rahul_992',
    drugName: 'Glimepiride',
    dosage: '1mg',
    frequency: 'Once daily before breakfast',
    prescribedDate: '2026-08-21',
    prescribingDoctor: 'Dr. Ananya Sen, MD (Endocrinology)',
    sourceHospital: 'Apollo Health City, Hyderabad',
    manuallyCorrected: false,
  },
  {
    prescriptionId: 'rx_003',
    documentId: 'doc_manipal_rx_0302',
    userId: 'usr_rahul_992',
    drugName: 'Telmisartan',
    dosage: '40mg',
    frequency: 'Once daily (morning)',
    prescribedDate: '2026-03-02',
    prescribingDoctor: 'Dr. Rajesh Mehta, MD',
    sourceHospital: 'Manipal Hospital, Bengaluru',
    manuallyCorrected: true, // handwriting required manual correction
  },
];

export const initialLabResults: LabResult[] = [
  {
    labResultId: 'lab_001',
    documentId: 'doc_apollo_lab_0820',
    userId: 'usr_rahul_992',
    testName: 'Fasting Blood Glucose',
    value: 138,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    testDate: '2026-08-20',
    sourceLab: 'Apollo Hospitals Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'high',
  },
  {
    labResultId: 'lab_002',
    documentId: 'doc_apollo_lab_0820',
    userId: 'usr_rahul_992',
    testName: 'HbA1c (Glycated Hemoglobin)',
    value: 7.1,
    unit: '%',
    referenceRangeLow: 4.0,
    referenceRangeHigh: 5.6,
    testDate: '2026-08-20',
    sourceLab: 'Apollo Hospitals Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'high',
  },
  {
    labResultId: 'lab_003',
    documentId: 'doc_max_lab_0410',
    userId: 'usr_rahul_992',
    testName: 'Fasting Blood Glucose',
    value: 122,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    testDate: '2026-04-10',
    sourceLab: 'Max Healthcare Diagnostics',
    manuallyCorrected: false,
    statusFlag: 'moderate',
  },
  {
    labResultId: 'lab_004',
    documentId: 'doc_max_lab_0410',
    userId: 'usr_rahul_992',
    testName: 'HbA1c (Glycated Hemoglobin)',
    value: 6.6,
    unit: '%',
    referenceRangeLow: 4.0,
    referenceRangeHigh: 5.6,
    testDate: '2026-04-10',
    sourceLab: 'Max Healthcare Diagnostics',
    manuallyCorrected: false,
    statusFlag: 'moderate',
  },
  {
    labResultId: 'lab_005',
    documentId: 'doc_fortis_lab_0115',
    userId: 'usr_rahul_992',
    testName: 'Fasting Blood Glucose',
    value: 110,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    testDate: '2026-01-15',
    sourceLab: 'Fortis Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'moderate',
  },
  {
    labResultId: 'lab_006',
    documentId: 'doc_fortis_lab_0115',
    userId: 'usr_rahul_992',
    testName: 'HbA1c (Glycated Hemoglobin)',
    value: 6.2,
    unit: '%',
    referenceRangeLow: 4.0,
    referenceRangeHigh: 5.6,
    testDate: '2026-01-15',
    sourceLab: 'Fortis Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'moderate',
  },
  {
    labResultId: 'lab_007',
    documentId: 'doc_apollo_lab_0820',
    userId: 'usr_rahul_992',
    testName: 'Serum Creatinine',
    value: 0.95,
    unit: 'mg/dL',
    referenceRangeLow: 0.7,
    referenceRangeHigh: 1.2,
    testDate: '2026-08-20',
    sourceLab: 'Apollo Hospitals Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'normal',
  },
  {
    labResultId: 'lab_008',
    documentId: 'doc_apollo_lab_0820',
    userId: 'usr_rahul_992',
    testName: 'Total Serum Cholesterol',
    value: 194,
    unit: 'mg/dL',
    referenceRangeLow: 125,
    referenceRangeHigh: 200,
    testDate: '2026-08-20',
    sourceLab: 'Apollo Hospitals Clinical Labs',
    manuallyCorrected: false,
    statusFlag: 'normal',
  },
];

export const initialVaccinations: Vaccination[] = [
  {
    vaccinationId: 'vac_001',
    documentId: 'doc_vaccine_cowin_1110',
    userId: 'usr_rahul_992',
    vaccineName: 'COVAXIN (Inactivated COVID-19)',
    doseNumber: 3,
    dateAdministered: '2025-11-10',
    facility: 'Manipal Hospital Centre, Bengaluru',
    nextDueDate: undefined,
  },
  {
    vaccinationId: 'vac_002',
    documentId: 'doc_flu_vaccine_0918',
    userId: 'usr_rahul_992',
    vaccineName: 'Influenza (Quadrivalent Sub-unit)',
    doseNumber: 1,
    dateAdministered: '2025-09-18',
    facility: 'Apollo Immunization Clinic, Hyderabad',
    nextDueDate: '2026-09-18',
  },
];

export const initialRiskFlags: RiskFlag[] = [
  {
    flagId: 'flag_001',
    userId: 'usr_rahul_992',
    labResultId: 'lab_001',
    ruleTriggered: 'fasting_glucose_diabetic_threshold',
    thresholdDescription: 'Fasting glucose >= 126 mg/dL (ADA/WHO clinical diagnostic threshold)',
    severity: 'high',
    flaggedAt: '2026-08-20T12:00:00Z',
    acknowledged: false,
  },
  {
    flagId: 'flag_002',
    userId: 'usr_rahul_992',
    labResultId: 'lab_002',
    ruleTriggered: 'hba1c_elevated_threshold',
    thresholdDescription: 'HbA1c >= 6.5% (American Diabetes Association criterion for Type 2 Diabetes)',
    severity: 'high',
    flaggedAt: '2026-08-20T12:00:00Z',
    acknowledged: true,
  },
  {
    flagId: 'flag_003',
    userId: 'usr_rahul_992',
    labResultId: 'lab_003',
    ruleTriggered: 'impaired_fasting_glucose_pre_diabetes',
    thresholdDescription: 'Fasting glucose 100-125 mg/dL indicates Impaired Fasting Glucose (Pre-diabetes range)',
    severity: 'moderate',
    flaggedAt: '2026-04-10T11:00:00Z',
    acknowledged: true,
  },
];

export const initialAISummary: AISummary = {
  summaryId: 'sum_001',
  userId: 'usr_rahul_992',
  generatedAt: '2026-08-22T08:30:00Z',
  summaryText:
    'Consolidated health record analysis across 4 diagnostic reports and 2 prescriptions from Apollo Hospitals and Max Healthcare shows an escalating glycemic trajectory over a 7-month evaluation window. Fasting blood sugar increased from 110 mg/dL (Jan 2026) to 122 mg/dL (Apr 2026), ultimately crossing the clinical diagnostic threshold at 138 mg/dL (Aug 2026). HbA1c correspondingly climbed from 6.2% to 7.1%, prompting Dr. Ananya Sen to initiate Metformin 500mg BID and Glimepiride 1mg. Renal and cardiovascular markers remain stable with normal Serum Creatinine (0.95 mg/dL) and ongoing Telmisartan 40mg blood pressure therapy. Immunization status is verified current with completed Covaxin Booster.',
  sourceLabResultIds: ['lab_001', 'lab_002', 'lab_003', 'lab_004', 'lab_005', 'lab_006', 'lab_007'],
  sourcePrescriptionIds: ['rx_001', 'rx_002', 'rx_003'],
  trendNotes: [
    'Fasting glucose rising progressively across last 3 lab visits: 110 -> 122 -> 138 mg/dL (+25.4% escalation)',
    'HbA1c crossed from pre-diabetic (6.2%) into diabetic diagnostic range (7.1%)',
    'Oral hypoglycemic therapy (Metformin 500mg + Glimepiride 1mg) initiated on 21-Aug-2026',
    'Kidney filtration profile normal (Creatinine 0.95 mg/dL within 0.7 - 1.2 mg/dL ref)',
    'Seasonal Influenza vaccine renewal approaching due date (18-Sep-2026)',
  ],
};

// Longitudinal chart points matching the Dribbble illustration's dual curves
export const biomarkerTrendSeries = [
  { month: 'Jan', date: '2026-01-15', fastingGlucose: 110, hba1cFactor: 112, facility: 'Fortis Labs' },
  { month: 'Feb', date: '2026-02-15', fastingGlucose: 114, hba1cFactor: 115, facility: 'Fortis Labs' },
  { month: 'Mar', date: '2026-03-15', fastingGlucose: 118, hba1cFactor: 119, facility: 'Estimated' },
  { month: 'Apr', date: '2026-04-10', fastingGlucose: 122, hba1cFactor: 124, facility: 'Max Healthcare' },
  { month: 'May', date: '2026-05-15', fastingGlucose: 126, hba1cFactor: 129, facility: 'Estimated' },
  { month: 'Jun', date: '2026-06-20', fastingGlucose: 131, hba1cFactor: 133, facility: 'Apollo Health' },
  { month: 'Aug', date: '2026-08-20', fastingGlucose: 138, hba1cFactor: 142, facility: 'Apollo Labs (Flagged)' },
];

// Helper to assemble consolidated timeline
export function buildTimelineItems(
  prescriptions: Prescription[],
  labResults: LabResult[],
  vaccinations: Vaccination[],
  documents: HealthDocument[],
  riskFlags: RiskFlag[]
): TimelineItem[] {
  const docMap = new Map(documents.map((d) => [d.documentId, d]));
  const flagMap = new Map(riskFlags.map((f) => [f.labResultId, f]));

  const items: TimelineItem[] = [];

  // Lab Results
  labResults.forEach((lab) => {
    const doc = docMap.get(lab.documentId) || {
      documentId: lab.documentId,
      userId: lab.userId,
      type: 'lab_report',
      imageUrl: '',
      uploadedAt: lab.testDate,
      ocrStatus: 'success',
      rawOcrText: '',
      confidenceScore: 96,
    };
    const flag = flagMap.get(lab.labResultId);

    items.push({
      id: `item_${lab.labResultId}`,
      documentId: lab.documentId,
      type: 'lab_report',
      title: lab.testName,
      subtitle: `${lab.sourceLab || 'Diagnostic Center'} · Lab Report`,
      date: lab.testDate,
      sourceFacility: lab.sourceLab || 'Diagnostic Center',
      valueDisplay: `${lab.value} ${lab.unit}`,
      referenceRange: lab.referenceRangeLow && lab.referenceRangeHigh ? `${lab.referenceRangeLow} - ${lab.referenceRangeHigh} ${lab.unit}` : undefined,
      isFlagged: !!flag || lab.statusFlag === 'high' || lab.statusFlag === 'moderate',
      flagSeverity: flag?.severity || (lab.statusFlag === 'high' ? 'high' : lab.statusFlag === 'moderate' ? 'moderate' : undefined),
      flagRule: flag?.thresholdDescription,
      manuallyCorrected: lab.manuallyCorrected,
      ocrConfidence: doc.confidenceScore || 96,
      document: doc,
      rawPayload: lab,
    });
  });

  // Prescriptions
  prescriptions.forEach((rx) => {
    const doc = docMap.get(rx.documentId) || {
      documentId: rx.documentId,
      userId: rx.userId,
      type: 'prescription',
      imageUrl: '',
      uploadedAt: rx.prescribedDate,
      ocrStatus: rx.manuallyCorrected ? 'low_confidence' : 'success',
      rawOcrText: '',
      confidenceScore: rx.manuallyCorrected ? 78 : 94,
    };

    items.push({
      id: `item_${rx.prescriptionId}`,
      documentId: rx.documentId,
      type: 'prescription',
      title: rx.drugName,
      subtitle: `${rx.prescribingDoctor || 'Attending Physician'} · ${rx.dosage} (${rx.frequency})`,
      date: rx.prescribedDate,
      sourceFacility: rx.sourceHospital || 'Hospital OPD',
      valueDisplay: `${rx.dosage} · ${rx.frequency}`,
      referenceRange: 'Active Prescription',
      isFlagged: false,
      manuallyCorrected: rx.manuallyCorrected,
      ocrConfidence: doc.confidenceScore || (rx.manuallyCorrected ? 78 : 94),
      document: doc,
      rawPayload: rx,
    });
  });

  // Vaccinations
  vaccinations.forEach((vac) => {
    const doc = docMap.get(vac.documentId) || {
      documentId: vac.documentId,
      userId: vac.userId,
      type: 'vaccination',
      imageUrl: '',
      uploadedAt: vac.dateAdministered,
      ocrStatus: 'success',
      rawOcrText: '',
      confidenceScore: 98,
    };

    items.push({
      id: `item_${vac.vaccinationId}`,
      documentId: vac.documentId,
      type: 'vaccination',
      title: vac.vaccineName,
      subtitle: `${vac.facility || 'Immunization Center'} · ${vac.doseNumber ? `Dose ${vac.doseNumber}` : 'Immunized'}`,
      date: vac.dateAdministered,
      sourceFacility: vac.facility || 'Immunization Facility',
      valueDisplay: vac.doseNumber ? `Dose #${vac.doseNumber} Verified` : 'Administered',
      referenceRange: vac.nextDueDate ? `Next due: ${vac.nextDueDate}` : 'Completed Series',
      isFlagged: false,
      manuallyCorrected: false,
      ocrConfidence: doc.confidenceScore || 98,
      document: doc,
      rawPayload: vac,
    });
  });

  // Sort descending by date
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
