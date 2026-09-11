import { User, DocumentRecord, Prescription, LabResult, Vaccination, RiskFlag, UnifiedRecord, Summary } from '../types';

export const DEMO_USER: User = {
  id: 'user_rahul_01',
  name: 'Rahul Sharma',
  email: 'demo.rahul@medivault.local',
  dateOfBirth: '1985-04-12',
  createdAt: '2026-01-10T09:00:00Z',
  accountType: 'patient',
  abhaId: '91-8472-1920-4491',
  consentGiven: true,
  consentDate: '2026-01-10T09:05:00Z'
};

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc_lab_01',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Comprehensive Metabolic & Lipid Profile',
    uploadedAt: '2026-08-18T10:30:00Z',
    ocrStatus: 'success',
    sourceName: 'Dr. Lal PathLabs',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'DR. LAL PATHLABS\nPatient: Rahul Sharma, Age 24\nFasting Blood Glucose: 142 mg/dL (Normal: 70-99)\nHbA1c: 6.8 % (Normal: 4.0-5.6)\nLDL Cholesterol: 148 mg/dL (Desirable: <100)\nHDL: 42 mg/dL (Normal: >40)'
  },
  {
    id: 'doc_rx_01',
    userId: 'user_rahul_01',
    type: 'prescription',
    title: 'Glycemic Care Prescription',
    uploadedAt: '2026-08-18T14:15:00Z',
    ocrStatus: 'success',
    sourceName: 'Fortis Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'FORTIS HOSPITAL - ENDOCRINOLOGY CLINIC\nDr. Arvind Swaminathan, MD (Endocrinology)\nRx:\n1. Tab Metformin 500mg - 1 tab twice daily after meals\nFollow up in 4 weeks with FBS report.'
  },
  {
    id: 'doc_lab_02',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Fasting Plasma Glucose Follow-up',
    uploadedAt: '2026-07-20T08:45:00Z',
    ocrStatus: 'success',
    sourceName: 'SRL Diagnostics',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'SRL DIAGNOSTICS\nTest: Fasting Blood Sugar\nResult: 124 mg/dL\nRef: 70-99 mg/dL'
  },
  {
    id: 'doc_rx_02',
    userId: 'user_rahul_01',
    type: 'prescription',
    title: 'Acute Viral Fever Treatment',
    uploadedAt: '2026-08-05T11:20:00Z',
    ocrStatus: 'success',
    sourceName: 'CityCare Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'CityCare Hospital\nDr. Ananya Rao, MBBS\nTab Paracetamol 650mg SOS for fever / body ache'
  },
  {
    id: 'doc_rx_03',
    userId: 'user_rahul_01',
    type: 'prescription',
    title: 'Vitamin D3 Ergocalciferol Regimen',
    uploadedAt: '2026-07-15T16:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Apollo Clinic',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Apollo Clinic - General Medicine\nDr. Rajesh Mehta\nSyp / Cap Vitamin D3 60,000 IU once weekly on Sundays for 8 weeks'
  },
  {
    id: 'doc_lab_03',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Routine Health Checkup Glucose',
    uploadedAt: '2026-06-10T09:10:00Z',
    ocrStatus: 'success',
    sourceName: 'CityCare Diagnostics',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'CityCare Diagnostics\nFasting Blood Glucose: 108 mg/dL\nNormal Range: 70 - 99 mg/dL'
  },
  {
    id: 'doc_rx_04',
    userId: 'user_rahul_01',
    type: 'prescription',
    title: 'Cardiovascular Support Regimen',
    uploadedAt: '2026-03-12T10:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Fortis Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Fortis Healthcare\nDr. Arvind Swaminathan\nTab Telmisartan 40mg OD mornings'
  },
  {
    id: 'doc_lab_04',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Complete Blood Count (CBC) Panel',
    uploadedAt: '2026-05-02T11:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Apollo Diagnostics',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Apollo Diagnostics\nHb: 14.2 g/dL (Normal 13-17)\nPlatelets: 240,000 /mcL (Normal 150k-450k)\nWBC: 7,200 /mcL (Normal 4k-11k)'
  },
  {
    id: 'doc_lab_05',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Lipid Profile Screen',
    uploadedAt: '2026-01-15T09:30:00Z',
    ocrStatus: 'success',
    sourceName: 'Metropolis Healthcare',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Metropolis Healthcare\nTotal Cholesterol: 210 mg/dL (<200)\nTriglycerides: 160 mg/dL (<150)'
  },
  {
    id: 'doc_lab_06',
    userId: 'user_rahul_01',
    type: 'lab_report',
    title: 'Renal Function Test (KFT)',
    uploadedAt: '2025-11-10T12:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Max Super Speciality Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Max Healthcare\nSerum Creatinine: 0.9 mg/dL (0.7-1.3)\nBlood Urea Nitrogen: 14 mg/dL (7-20)'
  },
  {
    id: 'doc_vax_01',
    userId: 'user_rahul_01',
    type: 'vaccination',
    title: 'Annual Seasonal Influenza Vaccine',
    uploadedAt: '2025-08-18T15:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Apollo Clinic',
    imageUrl: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'Apollo Clinic Immunization\nVaccine: Influvac Tetra (Quadrivalent Influenza)\nDose: 0.5ml IM\nDate: 18 Aug 2025\nNext Booster: 18 Aug 2026'
  },
  {
    id: 'doc_vax_02',
    userId: 'user_rahul_01',
    type: 'vaccination',
    title: 'COVID-19 mRNA Precautionary Booster',
    uploadedAt: '2024-01-14T10:00:00Z',
    ocrStatus: 'success',
    sourceName: 'Max Healthcare',
    imageUrl: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
    rawOcrText: 'CoWIN / Max Healthcare\nCorbevax Booster\nAdministered: 14 Jan 2024\nBatch: CRB-90214'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx_01',
    documentId: 'doc_rx_01',
    userId: 'user_rahul_01',
    drugName: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily',
    prescribedDate: '2026-08-18',
    prescribingDoctor: 'Dr. Arvind Swaminathan',
    sourceHospital: 'Fortis Hospital',
    manuallyCorrected: false,
    reminderTime: '08:30',
    instructions: 'Take immediately after breakfast and dinner with water.'
  },
  {
    id: 'rx_02',
    documentId: 'doc_rx_02',
    userId: 'user_rahul_01',
    drugName: 'Paracetamol',
    dosage: '650 mg',
    frequency: 'As needed (SOS)',
    prescribedDate: '2026-08-05',
    prescribingDoctor: 'Dr. Ananya Rao',
    sourceHospital: 'CityCare Hospital',
    manuallyCorrected: false,
    instructions: 'Take 1 tablet every 6 hours only if fever exceeds 100°F.'
  },
  {
    id: 'rx_03',
    documentId: 'doc_rx_03',
    userId: 'user_rahul_01',
    drugName: 'Vitamin D3 (Cholecalciferol)',
    dosage: '60,000 IU',
    frequency: 'Once weekly',
    prescribedDate: '2026-07-15',
    prescribingDoctor: 'Dr. Rajesh Mehta',
    sourceHospital: 'Apollo Clinic',
    manuallyCorrected: false,
    reminderTime: '10:00',
    instructions: 'Take with milk after breakfast every Sunday for 8 weeks.'
  },
  {
    id: 'rx_04',
    documentId: 'doc_rx_04',
    userId: 'user_rahul_01',
    drugName: 'Telmisartan',
    dosage: '40 mg',
    frequency: 'Once daily',
    prescribedDate: '2026-03-12',
    prescribingDoctor: 'Dr. Arvind Swaminathan',
    sourceHospital: 'Fortis Hospital',
    manuallyCorrected: false,
    reminderTime: '08:00',
    instructions: 'Take in the morning on an empty stomach.'
  }
];

export const INITIAL_LAB_RESULTS: LabResult[] = [
  // Lab 01: 18 Aug 2026
  {
    id: 'lab_res_01',
    documentId: 'doc_lab_01',
    userId: 'user_rahul_01',
    testName: 'Fasting Blood Glucose',
    value: 142,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    referenceRangeText: '70–99 mg/dL',
    testDate: '2026-08-18',
    sourceLab: 'Dr. Lal PathLabs',
    manuallyCorrected: false,
    status: 'high'
  },
  {
    id: 'lab_res_02',
    documentId: 'doc_lab_01',
    userId: 'user_rahul_01',
    testName: 'HbA1c (Glycated Hemoglobin)',
    value: 6.8,
    unit: '%',
    referenceRangeLow: 4.0,
    referenceRangeHigh: 5.6,
    referenceRangeText: '4.0–5.6 %',
    testDate: '2026-08-18',
    sourceLab: 'Dr. Lal PathLabs',
    manuallyCorrected: false,
    status: 'high'
  },
  {
    id: 'lab_res_03',
    documentId: 'doc_lab_01',
    userId: 'user_rahul_01',
    testName: 'LDL Cholesterol',
    value: 148,
    unit: 'mg/dL',
    referenceRangeLow: 0,
    referenceRangeHigh: 100,
    referenceRangeText: '< 100 mg/dL',
    testDate: '2026-08-18',
    sourceLab: 'Dr. Lal PathLabs',
    manuallyCorrected: false,
    status: 'high'
  },
  {
    id: 'lab_res_04',
    documentId: 'doc_lab_01',
    userId: 'user_rahul_01',
    testName: 'HDL Cholesterol',
    value: 42,
    unit: 'mg/dL',
    referenceRangeLow: 40,
    referenceRangeHigh: 60,
    referenceRangeText: '> 40 mg/dL',
    testDate: '2026-08-18',
    sourceLab: 'Dr. Lal PathLabs',
    manuallyCorrected: false,
    status: 'normal'
  },

  // Lab 02: 20 Jul 2026
  {
    id: 'lab_res_05',
    documentId: 'doc_lab_02',
    userId: 'user_rahul_01',
    testName: 'Fasting Blood Glucose',
    value: 124,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    referenceRangeText: '70–99 mg/dL',
    testDate: '2026-07-20',
    sourceLab: 'SRL Diagnostics',
    manuallyCorrected: false,
    status: 'high'
  },

  // Lab 03: 10 Jun 2026
  {
    id: 'lab_res_06',
    documentId: 'doc_lab_03',
    userId: 'user_rahul_01',
    testName: 'Fasting Blood Glucose',
    value: 108,
    unit: 'mg/dL',
    referenceRangeLow: 70,
    referenceRangeHigh: 99,
    referenceRangeText: '70–99 mg/dL',
    testDate: '2026-06-10',
    sourceLab: 'CityCare Diagnostics',
    manuallyCorrected: false,
    status: 'high'
  },

  // Lab 04: 02 May 2026
  {
    id: 'lab_res_07',
    documentId: 'doc_lab_04',
    userId: 'user_rahul_01',
    testName: 'Hemoglobin',
    value: 14.2,
    unit: 'g/dL',
    referenceRangeLow: 13.0,
    referenceRangeHigh: 17.0,
    referenceRangeText: '13.0–17.0 g/dL',
    testDate: '2026-05-02',
    sourceLab: 'Apollo Diagnostics',
    manuallyCorrected: false,
    status: 'normal'
  },
  {
    id: 'lab_res_08',
    documentId: 'doc_lab_04',
    userId: 'user_rahul_01',
    testName: 'Platelet Count',
    value: 240,
    unit: '10^3/µL',
    referenceRangeLow: 150,
    referenceRangeHigh: 450,
    referenceRangeText: '150–450 10^3/µL',
    testDate: '2026-05-02',
    sourceLab: 'Apollo Diagnostics',
    manuallyCorrected: false,
    status: 'normal'
  },

  // Lab 05: 15 Jan 2026
  {
    id: 'lab_res_09',
    documentId: 'doc_lab_05',
    userId: 'user_rahul_01',
    testName: 'Total Cholesterol',
    value: 210,
    unit: 'mg/dL',
    referenceRangeLow: 0,
    referenceRangeHigh: 200,
    referenceRangeText: '< 200 mg/dL',
    testDate: '2026-01-15',
    sourceLab: 'Metropolis Healthcare',
    manuallyCorrected: false,
    status: 'high'
  },

  // Lab 06: 10 Nov 2025
  {
    id: 'lab_res_10',
    documentId: 'doc_lab_06',
    userId: 'user_rahul_01',
    testName: 'Serum Creatinine',
    value: 0.9,
    unit: 'mg/dL',
    referenceRangeLow: 0.7,
    referenceRangeHigh: 1.3,
    referenceRangeText: '0.7–1.3 mg/dL',
    testDate: '2025-11-10',
    sourceLab: 'Max Super Speciality Hospital',
    manuallyCorrected: false,
    status: 'normal'
  }
];

export const INITIAL_VACCINATIONS: Vaccination[] = [
  {
    id: 'vax_01',
    documentId: 'doc_vax_01',
    userId: 'user_rahul_01',
    vaccineName: 'Influenza (Quadrivalent)',
    doseNumber: 1,
    dateAdministered: '2025-08-18',
    facility: 'Apollo Clinic',
    nextDueDate: '2026-08-18'
  },
  {
    id: 'vax_02',
    documentId: 'doc_vax_02',
    userId: 'user_rahul_01',
    vaccineName: 'COVID-19 mRNA Booster',
    doseNumber: 3,
    dateAdministered: '2024-01-14',
    facility: 'Max Healthcare'
  }
];

export const INITIAL_RISK_FLAGS: RiskFlag[] = [
  {
    id: 'flag_01',
    userId: 'user_rahul_01',
    labResultId: 'lab_res_01',
    testName: 'Fasting Blood Glucose',
    currentValue: 142,
    unit: 'mg/dL',
    ruleTriggered: 'fasting_glucose_diabetic_threshold',
    thresholdDescription: 'Fasting glucose ≥ 126 mg/dL (Established ADA / WHO threshold for impaired fasting glycemia)',
    severity: 'high',
    flaggedAt: '2026-08-18T10:30:00Z',
    acknowledged: false,
    explanation: 'Your fasting glucose reading of 142 mg/dL crosses the published clinical threshold of 126 mg/dL. Values at this level are commonly monitored for glucose intolerance or pre-diabetes and warrant consultation with a physician for confirmation.',
    sourceLab: 'Dr. Lal PathLabs'
  },
  {
    id: 'flag_02',
    userId: 'user_rahul_01',
    labResultId: 'lab_res_03',
    testName: 'LDL Cholesterol',
    currentValue: 148,
    unit: 'mg/dL',
    ruleTriggered: 'ldl_elevated_threshold',
    thresholdDescription: 'LDL Cholesterol > 100 mg/dL (Standard clinical threshold for optimal atherogenic lipid levels)',
    severity: 'moderate',
    flaggedAt: '2026-08-18T10:30:00Z',
    acknowledged: false,
    explanation: 'LDL cholesterol is measured at 148 mg/dL, which is above the standard desirable reference range of under 100 mg/dL. Elevated LDL is a standard marker reviewed during cardiovascular and metabolic assessments.',
    sourceLab: 'Dr. Lal PathLabs'
  }
];

export const INITIAL_SUMMARY: Summary = {
  id: 'summary_01',
  userId: 'user_rahul_01',
  generatedAt: '2026-08-18T12:00:00Z',
  summaryText: 'Your health record history shows 12 consolidated documents across Fortis Hospital, Apollo Clinic, and Dr. Lal PathLabs. A steady upward trend is observed in fasting blood glucose across your last 3 consecutive lab tests (108 mg/dL in June → 124 mg/dL in July → 142 mg/dL in August), corresponding with an HbA1c of 6.8%. Dr. Arvind Swaminathan prescribed Metformin 500mg twice daily on 18 Aug 2026. Routine renal markers and complete blood counts remain within reference ranges. Your annual influenza booster was due on 18 August 2026.',
  sourceLabResultIds: ['lab_res_01', 'lab_res_02', 'lab_res_03', 'lab_res_05', 'lab_res_06'],
  sourcePrescriptionIds: ['rx_01', 'rx_03'],
  trendNotes: [
    'Fasting glucose has risen steadily across the last 3 tests (108 → 124 → 142 mg/dL).',
    'HbA1c measured at 6.8% in latest metabolic panel.',
    'LDL cholesterol (148 mg/dL) exceeds optimal reference threshold of 100 mg/dL.',
    'Seasonal influenza immunization reached 1-year mark on 18 Aug 2026.'
  ]
};
