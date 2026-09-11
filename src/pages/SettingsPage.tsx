import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Download,
  Trash2,
  LogOut,
  Users,
  CheckCircle2,
  Edit2,
  Check,
} from 'lucide-react';
import { PatientProfile } from '../types';
import { currentUser } from '../data/mockHealthData';
import { showToast } from '../components/Toast';
import { soundFX } from '../utils/audioEffects';

interface SettingsPageProps {
  activeProfile?: PatientProfile;
  allProfiles?: PatientProfile[];
  onSelectProfile?: (p: PatientProfile) => void;
  onUpdateProfile?: (p: PatientProfile) => void;
  onLoadSampleData?: () => void;
  onClearAllData?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeProfile,
  allProfiles = [],
  onSelectProfile,
  onUpdateProfile,
  onLoadSampleData,
  onClearAllData,
}) => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [consentActive, setConsentActive] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Editable Profile fields
  const [name, setName] = useState(activeProfile?.name || currentUser.name);
  const [bloodGroup, setBloodGroup] = useState(activeProfile?.bloodGroup || 'B+');
  const [allergies, setAllergies] = useState(activeProfile?.allergies?.join(', ') || 'Penicillin (mild)');
  const [emergencyContact, setEmergencyContact] = useState(
    activeProfile?.emergencyContact || '+91 98450 12345 (Priya - Wife)'
  );

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playChime();
    showToast('info', next ? 'Audio FX Enabled' : 'Audio FX Muted');
  };

  const handleSaveProfile = () => {
    if (activeProfile && onUpdateProfile) {
      const updated: PatientProfile = {
        ...activeProfile,
        name,
        bloodGroup,
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContact,
      };
      onUpdateProfile(updated);
    }
    setIsEditingProfile(false);
    soundFX.playChime();
    showToast('success', 'Profile Saved', 'Clinical vitals updated successfully');
  };

  const handleExportData = () => {
    soundFX.playChime();
    const exportPayload = {
      patient: activeProfile || currentUser,
      exportedAt: new Date().toISOString(),
      compliance: 'DPDP Act 2023 Compliant Export',
      schemaVersion: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medivault_${(activeProfile?.name || 'patient').toLowerCase().replace(/\s+/g, '_')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data Exported', 'Full encrypted health record downloaded as JSON');
  };

  const handleDeleteData = () => {
    if (
      window.confirm(
        'Are you sure you want to invoke your DPDP Act Right to Erasure? All extracted lab records, prescriptions, and document scans will be permanently purged.'
      )
    ) {
      soundFX.playAlertPulse();
      showToast('error', 'Data Purged', 'All patient records removed under DPDP Act compliance');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medivault_authenticated');
    showToast('info', 'Signed Out', 'You have been safely signed out');
    navigate('/login');
  };

  const currentProf = activeProfile || {
    userId: currentUser.userId,
    name: currentUser.name,
    relationship: 'self',
    gender: 'Male',
    dateOfBirth: currentUser.dateOfBirth,
    createdAt: currentUser.createdAt,
    bloodGroup: 'B+',
    allergies: ['Penicillin (mild)'],
    emergencyContact: '+91 98450 12345 (Priya - Wife)',
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings & Family Profiles</h2>
          <p className="page-subtitle">
            Manage your patient profile, family member records, and DPDP Act privacy consent
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Patient Profile Card with Clinical Vitals */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} />
              <span>Active Patient Profile</span>
            </div>
            <button
              onClick={() => {
                if (isEditingProfile) handleSaveProfile();
                else setIsEditingProfile(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4F46E5',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isEditingProfile ? (
                <>
                  <Check size={14} /> Save
                </>
              ) : (
                <>
                  <Edit2 size={13} /> Edit Details
                </>
              )}
            </button>
          </div>

          <div className="settings-profile">
            <div className="settings-avatar">
              {currentProf.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="settings-profile-info" style={{ width: '100%' }}>
              {isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Blood Group</label>
                      <input
                        type="text"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Known Allergies (comma separated)</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Peanuts"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="settings-profile-name">{currentProf.name}</div>
                  <div className="settings-profile-detail">
                    DOB:{' '}
                    {new Date(currentProf.dateOfBirth).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    · UHID: <span style={{ fontFamily: 'monospace' }}>{currentProf.userId}</span>
                  </div>
                  <div className="settings-profile-detail">
                    Blood Group: <strong>{currentProf.bloodGroup || 'B+'}</strong> · Emergency Contact:{' '}
                    {currentProf.emergencyContact || 'None listed'}
                  </div>
                  <div className="settings-profile-detail" style={{ color: '#DC2626' }}>
                    Allergies: {currentProf.allergies?.join(', ') || 'None recorded'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Family Member Switcher (PRD Stretch Feature #5) */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <Users size={18} />
            <span>Family Profiles (PRD Multi-Profile)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allProfiles.map((p) => {
              const isSelected = p.userId === currentProf.userId;
              return (
                <div
                  key={p.userId}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                    border: isSelected ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#4F46E5' : '#E2E8F0',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {p.relationship === 'self'
                          ? 'Primary Account (Self)'
                          : p.relationship === 'mother'
                          ? 'Mother (Chronic Tracking)'
                          : 'Child (Pediatric Vaccines)'}{' '}
                        · Blood: {p.bloodGroup || 'B+'}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#4F46E5',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={14} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        if (onSelectProfile) onSelectProfile(p);
                        showToast('info', 'Profile Switched', `Viewing health vault for ${p.name}`);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      Switch To
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy & Consent (DPDP Act 2023) */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <ShieldCheck size={18} />
            <span>DPDP Act 2023 Privacy & Compliance</span>
          </div>

          <div className="settings-toggle-list">
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">Health Data Processing Consent</div>
                <div className="settings-toggle-desc">
                  Allow OCR extraction and ADA/WHO threshold analysis on uploaded medical records
                </div>
              </div>
              <button
                className={`settings-toggle-btn ${consentActive ? 'active' : ''}`}
                onClick={() => {
                  const next = !consentActive;
                  setConsentActive(next);
                  showToast(
                    next ? 'success' : 'error',
                    next ? 'Consent Granted' : 'Consent Withdrawn',
                    next ? 'Health data processing is active' : 'Medical record processing has been suspended'
                  );
                }}
              >
                <div className="settings-toggle-thumb" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">Audio & Haptic Sound Feedback</div>
                <div className="settings-toggle-desc">
                  Play interactive auditory cues on scan completion, alerts, and dose logging
                </div>
              </div>
              <button
                className={`settings-toggle-btn ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
              >
                <div className="settings-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* Vault Data Controls (Clean State vs Demo State) */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <ShieldCheck size={18} />
            <span>Vault Data State Management</span>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px 0' }}>
            Switch between a fresh, zero-data vault (ready for real uploads and Supabase connection) or populate multi-hospital sample records for evaluation.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {onClearAllData && (
              <button
                onClick={onClearAllData}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={15} color="#DC2626" />
                <span>Reset to Clean State</span>
              </button>
            )}

            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="btn-primary"
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  justifyContent: 'center',
                }}
              >
                <span>Load Sample Records</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Ownership Actions */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <Download size={18} />
            <span>Data Rights & Account Actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleExportData}
              className="btn-secondary"
              style={{ justifyContent: 'center', width: '100%', height: '42px' }}
            >
              <Download size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Export Patient Health Record (JSON)
            </button>

            <button
              onClick={handleDeleteData}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={16} />
              Purge Health Records (Right to Erasure)
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '6px',
              }}
            >
              <LogOut size={16} />
              Sign Out of MediVault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
