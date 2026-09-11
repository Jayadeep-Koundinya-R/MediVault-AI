import { FamilyRelationship, FamilyAccessPermissions } from '../types';
import { authService } from './authService';

export const familyService = {
  async getFamilyMembers(): Promise<FamilyRelationship[]> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/family', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch family members');
    }
    return data.familyMembers || [];
  },

  async addFamilyMember(params: { name: string; relationshipType: string; email?: string }): Promise<FamilyRelationship> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to add family member');
    }
    return data.relationship;
  },

  async getFamilyMemberDetail(id: string): Promise<any> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/family/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch family member detail');
    }
    return data;
  },

  async acceptFamilyInvitation(id: string): Promise<void> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/family/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to accept family invitation');
    }
  },

  async revokeFamilyAccess(id: string): Promise<void> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/family/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to revoke family access');
    }
  },

  async getFamilyPermissions(id: string): Promise<FamilyAccessPermissions> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/family/${id}/permissions`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch permissions');
    }
    return data.permissions;
  },

  async updateFamilyPermissions(id: string, perms: Partial<FamilyAccessPermissions>): Promise<void> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/family/${id}/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(perms),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update family permissions');
    }
  },
};
