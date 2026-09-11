// Type definitions matching schema.md exactly

export interface User {
  userId: string;
  name: string;
  dateOfBirth: string; // ISO date YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export interface PatientProfile extends User {
  relationship: 'self' | 'mother' | 'father' | 'child' | 'spouse';
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: string;
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

// Doctor Consultation & Review Queue Types
export interface Doctor {
  doctorId: string;
  name: string;
  specialty: string;
  hospital: string;
  licenseNumber: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  isPartner: boolean;
  availableNow: boolean;
  avatarUrl?: string;
  bio?: string;
}

export interface TriageResponse {
  question: string;
  answer: string;
}

export type ConsultationStatus = 'waiting_review' | 'in_consultation' | 'completed';
export type ConsultationUrgency = 'high' | 'moderate' | 'routine';

export interface Consultation {
  consultationId: string;
  userId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: ConsultationStatus;
  urgency: ConsultationUrgency;
  flaggedSummary: string;
  relatedDocumentIds: string[];
  triageResponses: TriageResponse[];
  doctorClinicalNote?: string;
  recommendedFollowUpDate?: string;
  negotiatedPlan?: string;
  rating?: number;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  messageId: string;
  consultationId: string;
  sender: 'patient' | 'doctor' | 'system';
  text: string;
  timestamp: string;
  attachments?: string[];
}

// Retention Notifications
export type NotificationType =
  | 'follow_up'
  | 'risk_flag'
  | 'medicine_reminder'
  | 'vaccine_due'
  | 'inactivity'
  | 'doctor_message';

export interface AppNotification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

// Monetization & Plans
export type PlanId = 'free' | 'patient_pro' | 'family_vault' | 'pay_per_consult';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
}

export interface DoctorEarnings {
  totalEarned: number;
  pendingPayout: number;
  completedReviews: number;
  currency: string;
}
