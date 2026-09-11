import { DoctorProfile, DoctorPatientRelationship, DoctorReview } from '../types';
import { authService } from './authService';

export const doctorService = {
  async searchDoctors(query: string = ''): Promise<DoctorProfile[]> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/doctors/search?q=${encodeURIComponent(query)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to search doctors');
    }
    return data.doctors || [];
  },

  async getDoctorProfile(doctorId?: string): Promise<DoctorProfile> {
    const token = await authService.getSessionToken();
    const url = doctorId ? `/api/doctors/profile?doctorId=${encodeURIComponent(doctorId)}` : '/api/doctors/profile';
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch doctor profile');
    }
    return data.profile;
  },

  async updateDoctorProfile(profile: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctors/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update doctor profile');
    }
    return data.profile;
  },

  async verifyDoctor(doctorId?: string, status: string = 'verified'): Promise<void> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctors/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId: doctorId, status }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to verify doctor');
    }
  },

  async getDoctorRequests(): Promise<DoctorPatientRelationship[]> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctor/requests', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch doctor requests');
    }
    return data.requests || [];
  },

  async requestConnection(doctorId: string): Promise<string> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctor/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ doctorId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send connection request');
    }
    return data.relationshipId;
  },

  async updateRequestStatus(params: {
    requestId: string;
    status?: 'accepted' | 'declined' | 'revoked';
    permissions?: {
      shareSummary?: boolean;
      shareLabs?: boolean;
      sharePrescriptions?: boolean;
      shareVaccinations?: boolean;
      shareOriginalDocuments?: boolean;
    };
  }): Promise<void> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctor/requests', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update request status');
    }
  },

  async getDoctorPatients(): Promise<any[]> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctor/patients', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch doctor patients');
    }
    return data.patients || [];
  },

  async getDoctorPatientDetail(patientId: string): Promise<any> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/doctor/patients/${patientId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch patient detail');
    }
    return data;
  },

  async getDoctorReports(tab: 'all' | 'needs_review' | 'reviewed' = 'all'): Promise<any[]> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/doctor/reports?tab=${tab}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch reports');
    }
    return data.reports || [];
  },

  async submitDoctorReview(summaryId: string, patientId: string, reviewText: string): Promise<DoctorReview> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/doctor/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ summaryId, patientId, reviewText }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to submit review');
    }
    return data.review;
  },

  async getDoctorReviews(summaryId?: string, patientId?: string): Promise<DoctorReview[]> {
    const token = await authService.getSessionToken();
    const params = new URLSearchParams();
    if (summaryId) params.set('summaryId', summaryId);
    if (patientId) params.set('patientId', patientId);

    const res = await fetch(`/api/doctor/reviews?${params.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch reviews');
    }
    return data.reviews || [];
  },
};
