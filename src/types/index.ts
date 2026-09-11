export type RecordType = 'prescription' | 'lab_report' | 'vaccination';

export type OCRStatus = 'pending' | 'success' | 'low_confidence' | 'failed';

export type FlagSeverity = 'info' | 'moderate' | 'high';

export type AccountType = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  createdAt: string;
  accountType?: AccountType;
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

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientId: string;
  summaryId: string;
  reviewText: string;
  status: 'reviewed' | 'draft' | 'archived';
  reviewedAt: string;
  createdAt: string;
  doctorName?: string;
  doctorSpecialization?: string;
  doctorClinic?: string;
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
  doctorReviews?: DoctorReview[];
  isDoctorReviewed?: boolean;
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

// ----------------------------------------------------
// HealthVault 2.0 Types: Doctor, Family, Chat, Perms
// ----------------------------------------------------

export interface DoctorProfile {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  specialization: string;
  medicalRegistrationNumber: string;
  registrationCountry: string;
  clinicName: string;
  clinicAddress?: string;
  yearsOfExperience: number;
  bio?: string;
  profilePhotoPath?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAccessPermissions {
  id: string;
  relationshipId: string;
  shareSummary: boolean;
  shareLabs: boolean;
  sharePrescriptions: boolean;
  shareVaccinations: boolean;
  shareOriginalDocuments: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorPatientRelationship {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  requestedBy: string;
  createdAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  doctorProfile?: DoctorProfile;
  patientProfile?: {
    id: string;
    fullName: string;
    email?: string;
    dateOfBirth?: string;
  };
  permissions?: DoctorAccessPermissions;
}

export interface FamilyAccessPermissions {
  id: string;
  familyRelationshipId: string;
  shareSummary: boolean;
  shareLabs: boolean;
  sharePrescriptions: boolean;
  shareVaccinations: boolean;
  shareFlags: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth?: string;
  relationship: string;
}

export interface FamilyRelationship {
  id: string;
  ownerUserId: string;
  memberUserId?: string;
  memberName: string;
  relationshipType: string;
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  permissions?: FamilyAccessPermissions;
  avatarUrl?: string;
  sharedSummaryCount?: number;
  sharedRecordsCount?: number;
  sharedFlagsCount?: number;
  lastUpdateDate?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageText: string;
  sharedSummaryId?: string;
  readAt?: string;
  createdAt: string;
  sharedSummary?: {
    id: string;
    generatedAt: string;
    summaryText: string;
    trendCount: number;
    flagCount: number;
  };
}

export interface Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
  partnerName: string;
  partnerRole?: string;
  partnerClinic?: string;
  isVerified?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'doctor_request' | 'doctor_request_accepted' | 'doctor_request_declined' | 'new_message' | 'doctor_review' | 'summary_shared' | 'family_request' | 'family_request_accepted';
  title: string;
  body?: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  actorUserId: string;
  patientUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  createdAt: string;
  actorName?: string;
}
