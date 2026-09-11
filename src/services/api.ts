// MediVault-AI Client API Service Layer
// Prepared for seamless transition to Backend API (FastAPI / Node / Express / Go)
// Follows schema.md endpoints and data structures

import {
  HealthDocument,
  AISummary,
  PatientProfile,
  DocumentType,
  Consultation,
} from '../types';
import { supabase } from './supabaseClient';

import {
  currentUser,
  initialDocuments,
  initialPrescriptions,
  initialLabResults,
  initialVaccinations,
  initialRiskFlags,
  initialAISummary,
} from '../data/mockHealthData';

// Family profiles for multi-profile management (PRD Stretch Feature #5)
export const initialFamilyProfiles: PatientProfile[] = [
  {
    userId: 'usr_rahul_992',
    name: 'Rahul Sharma',
    relationship: 'self',
    gender: 'Male',
    dateOfBirth: '1984-06-12',
    bloodGroup: 'B+',
    allergies: ['Penicillin (mild rash)'],
    emergencyContact: '+91 98450 12345 (Wife - Priya)',
    createdAt: '2025-10-01T09:00:00Z',
  },
  {
    userId: 'usr_sunita_412',
    name: 'Sunita Sharma',
    relationship: 'mother',
    gender: 'Female',
    dateOfBirth: '1956-02-18',
    bloodGroup: 'O+',
    allergies: ['Sulfa drugs'],
    emergencyContact: '+91 98450 12345 (Son - Rahul)',
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    userId: 'usr_aarav_881',
    name: 'Aarav Sharma',
    relationship: 'child',
    gender: 'Male',
    dateOfBirth: '2014-11-05',
    bloodGroup: 'B+',
    allergies: ['Peanuts'],
    emergencyContact: '+91 98450 12345 (Father - Rahul)',
    createdAt: '2026-02-01T14:15:00Z',
  },
];

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

class MediVaultAPI {
  private isOnlineBackend(): boolean {
    return Boolean(API_BASE_URL);
  }

  // Documents & OCR
  async uploadDocument(
    file: File | { name: string; size: number },
    type: DocumentType
  ): Promise<HealthDocument> {
    if (this.isOnlineBackend()) {
      const formData = new FormData();
      formData.append('file', file as Blob);
      formData.append('type', type);
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    }

    // Local simulation
    const docId = `doc_${Date.now()}`;
    return {
      documentId: docId,
      userId: currentUser.userId,
      type,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      uploadedAt: new Date().toISOString(),
      ocrStatus: 'success',
      confidenceScore: 95.8,
      rawOcrText: `DOCUMENT PARSED BY MEDIVAULT-AI OCR ENGINE\nType: ${type}\nExtracted at: ${new Date().toLocaleString()}`,
    };
  }

  // Profiles
  async getProfiles(): Promise<PatientProfile[]> {
    const saved = localStorage.getItem('medivault_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialFamilyProfiles;
  }

  async saveProfile(profile: PatientProfile): Promise<PatientProfile> {
    const current = await this.getProfiles();
    const index = current.findIndex((p) => p.userId === profile.userId);
    let updated: PatientProfile[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = profile;
    } else {
      updated = [...current, profile];
    }
    localStorage.setItem('medivault_profiles', JSON.stringify(updated));
    return profile;
  }

  // AI Summary Generation
  async generateSummary(userId: string, language: string = 'en'): Promise<AISummary> {
    if (this.isOnlineBackend()) {
      const res = await fetch(`${API_BASE_URL}/api/summaries/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, language }),
      });
      if (!res.ok) throw new Error('Summary generation failed');
      return res.json();
    }

    return {
      ...initialAISummary,
      generatedAt: new Date().toISOString(),
    };
  }

  // Health data getters
  getInitialData() {
    return {
      documents: initialDocuments,
      prescriptions: initialPrescriptions,
      labResults: initialLabResults,
      vaccinations: initialVaccinations,
      riskFlags: initialRiskFlags,
      summary: initialAISummary,
    };
  }
}

export const api = new MediVaultAPI();

// Step 1: Real Supabase query functions with safe zero-crash fallbacks
export async function fetchPatientProfile(userId: string = currentUser.userId): Promise<PatientProfile | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        return {
          userId: data.user_id,
          name: data.name,
          relationship: data.relationship || 'self',
          gender: data.gender || 'Male',
          dateOfBirth: data.date_of_birth,
          bloodGroup: data.blood_group,
          allergies: data.allergies || [],
          emergencyContact: data.emergency_contact,
          createdAt: data.created_at,
        };
      }
    }
  } catch (err) {
    console.warn('Supabase fetchPatientProfile fallback:', err);
  }
  return initialFamilyProfiles[0] || null;
}

export async function fetchHealthDocuments(userId: string = currentUser.userId): Promise<HealthDocument[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('health_documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          documentId: d.document_id,
          userId: d.user_id,
          type: d.type,
          imageUrl: d.image_url,
          uploadedAt: d.uploaded_at,
          ocrStatus: d.ocr_status,
          confidenceScore: d.confidence_score,
          rawOcrText: d.raw_ocr_text,
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase fetchHealthDocuments fallback:', err);
  }
  return [];
}

export async function fetchConsultations(userId: string = currentUser.userId): Promise<Consultation[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((c: any) => ({
          consultationId: c.consultation_id,
          userId: c.user_id,
          patientName: c.patient_name || 'Patient Profile',
          doctorId: c.doctor_id,
          doctorName: c.doctor_name || 'Physician Specialist',
          status: (c.status as any) || 'waiting_review',
          urgency: (c.urgency as any) || 'routine',
          flaggedSummary: c.flagged_summary || '',
          relatedDocumentIds: c.related_document_ids || [],
          triageResponses: c.triage_responses || [],
          doctorClinicalNote: c.doctor_clinical_note,
          recommendedFollowUpDate: c.recommended_follow_up_date,
          negotiatedPlan: c.negotiated_plan,
          rating: c.rating,
          createdAt: c.created_at || new Date().toISOString(),
          completedAt: c.completed_at,
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase fetchConsultations fallback:', err);
  }
  return [];
}

