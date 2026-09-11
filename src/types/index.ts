export type RecordType = 'prescription' | 'lab_report' | 'vaccination';

export type OCRStatus = 'pending' | 'success' | 'low_confidence' | 'failed';

export type FlagSeverity = 'info' | 'moderate' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  createdAt: string;
  abhaId?: string;
  consentGiven: boolean;
  consentDate?: string;
  consentGivenAt?: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  type: RecordType;
  title: string;
  imageUrl?: string;
  uploadedAt: string;
  ocrStatus: OCRStatus;
  rawOcrText?: string;
  sourceName?: string;
}

export interface Prescription {
  id: string;
  documentId: string;
  userId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribingDoctor: string;
  sourceHospital: string;
  manuallyCorrected?: boolean;
  reminderTime?: string;
  instructions?: string;
}

export interface LabResult {
  id: string;
  documentId: string;
  userId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  referenceRangeText?: string;
  testDate: string;
  sourceLab: string;
  manuallyCorrected?: boolean;
  status: 'normal' | 'high' | 'low';
}

export interface Vaccination {
  id: string;
  documentId: string;
  userId: string;
  vaccineName: string;
  doseNumber?: number;
  dateAdministered: string;
  facility: string;
  nextDueDate?: string;
  batchNumber?: string;
}

export interface Summary {
  id: string;
  userId: string;
  generatedAt: string;
  summaryText: string;
  overview?: string;
  activeMedications?: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
  }>;
  sourceLabResultIds: string[];
  sourcePrescriptionIds: string[];
  trendNotes: string[];
}

export interface RiskFlag {
  id: string;
  userId: string;
  recordId?: string;
  labResultId: string;
  testName: string;
  parameter?: string;
  currentValue?: number;
  value?: number;
  unit: string;
  ruleTriggered: string;
  thresholdDescription: string;
  threshold?: string;
  clinicalGuideline?: string;
  severity: FlagSeverity;
  flaggedAt: string;
  date?: string;
  acknowledged: boolean;
  status?: 'reviewed' | 'unreviewed';
  message?: string;
  explanation: string;
  sourceLab: string;
}

export interface UnifiedRecord {
  id: string;
  document: DocumentRecord;
  type: RecordType;
  title: string;
  date: string;
  sourceName: string;
  imageUrl?: string;
  status?: 'normal' | 'abnormal' | 'attention_needed';
  prescription?: Prescription;
  labResults?: LabResult[];
  vaccination?: Vaccination;
  flags?: RiskFlag[];
}

export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth: string;
  relationship: string;
  avatarUrl?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface FilterState {
  searchQuery: string;
  types: RecordType[];
  dateRange: 'all' | '7d' | '30d' | '6m' | 'custom';
  source: string;
}
