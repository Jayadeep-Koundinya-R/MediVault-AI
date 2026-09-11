// Type definitions matching schema.md exactly

export interface User {
  userId: string;
  name: string;
  dateOfBirth: string; // ISO date YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export type DocumentType = 'prescription' | 'lab_report' | 'vaccination';
export type OcrStatus = 'pending' | 'success' | 'low_confidence' | 'failed';

export interface HealthDocument {
  documentId: string;
  userId: string;
  type: DocumentType;
  imageUrl: string;
  uploadedAt: string;
  ocrStatus: OcrStatus;
  rawOcrText: string;
  confidenceScore?: number; // 0 - 100%
}

export interface Prescription {
  prescriptionId: string;
  documentId: string;
  userId: string;
  drugName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "twice daily"
  prescribedDate: string; // ISO date
  prescribingDoctor?: string;
  sourceHospital?: string;
  manuallyCorrected: boolean;
}

export interface LabResult {
  labResultId: string;
  documentId: string;
  userId: string;
  testName: string; // e.g. "Fasting Glucose"
  value: number;
  unit: string; // e.g. "mg/dL"
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  testDate: string; // ISO date
  sourceLab?: string;
  manuallyCorrected: boolean;
  statusFlag?: 'normal' | 'moderate' | 'high';
}

export interface Vaccination {
  vaccinationId: string;
  documentId: string;
  userId: string;
  vaccineName: string;
  doseNumber?: number;
  dateAdministered: string; // ISO date
  facility?: string;
  nextDueDate?: string; // ISO date
}

export interface AISummary {
  summaryId: string;
  userId: string;
  generatedAt: string;
  summaryText: string;
  sourceLabResultIds: string[];
  sourcePrescriptionIds: string[];
  trendNotes: string[];
}

export type RiskSeverity = 'info' | 'moderate' | 'high';

export interface RiskFlag {
  flagId: string;
  userId: string;
  labResultId: string;
  ruleTriggered: string; // e.g. "fasting_glucose_diabetic_threshold"
  thresholdDescription: string; // e.g. "Fasting glucose >= 126 mg/dL (ADA/WHO diabetes threshold)"
  severity: RiskSeverity;
  flaggedAt: string;
  acknowledged: boolean;
}

// Unified record representation for the consolidated timeline
export type TimelineItem = {
  id: string;
  documentId: string;
  type: DocumentType;
  title: string;
  subtitle: string;
  date: string;
  sourceFacility: string;
  valueDisplay: string;
  referenceRange?: string;
  isFlagged?: boolean;
  flagSeverity?: RiskSeverity;
  flagRule?: string;
  manuallyCorrected: boolean;
  ocrConfidence: number;
  document: HealthDocument;
  rawPayload: Prescription | LabResult | Vaccination;
};
