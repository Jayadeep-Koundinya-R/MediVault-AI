import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShieldCheck,
  Bell,
  Sparkles,
  Activity,
  Volume2,
  VolumeX,
  ChevronDown,
  Users,
  Check,
  Settings,
  Stethoscope,
} from 'lucide-react';
import { User, PatientProfile } from '../types';
import { soundFX } from '../utils/audioEffects';

interface TopNavProps {
  user: User;
  activeProfile?: PatientProfile;
  allProfiles?: PatientProfile[];
  onSelectProfile?: (p: PatientProfile) => void;
  onNavigateSettings?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenUpload: () => void;
  onOpenConsent: () => void;
  onOpenHologram: () => void;
  onOpenCopilot: () => void;
  unreadAlertCount: number;
  onAlertClick: () => void;
  onOpenNotifications?: () => void;
  isDoctorMode?: boolean;
  onToggleDoctorMode?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  activeProfile,
  allProfiles = [],
  onSelectProfile,
  onNavigateSettings,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenConsent,
  onOpenHologram,
  onOpenCopilot,
  unreadAlertCount,
  onAlertClick,
  onOpenNotifications,
  isDoctorMode = false,
  onToggleDoctorMode,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleSound = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playChime();
  };

  const currentDisplayProfile = activeProfile || {
    userId: user.userId,
    name: user.name,
    relationship: 'self',
    gender: 'Male',
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt,
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <div className="top-title-row">
          <h1 className="top-nav-title">HealthVault Records</h1>
          <button
            className="compliance-badge"
            onClick={onOpenConsent}
            title="Compliant with India Digital Personal Data Protection (DPDP) Act 2023"
            id="dpdp-badge-btn"
          >
            <ShieldCheck size={14} />
            <span>DPDP Act Verified</span>
          </button>
        </div>
        <p className="top-nav-subtitle">
          Consolidating prescriptions, lab reports, & vaccination history across hospitals via OCR
        </p>
      </div>

      <div className="top-nav-actions">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            id="search-records-input"
            className="search-input"
            placeholder="Search records, tests, drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 3D Organ Vitals Button */}
        <button
          id="btn-open-3d-hologram"
          onClick={() => {
            soundFX.playChime();
            onOpenHologram();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 700,
            padding: '0 15px',
            height: '42px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
            transition: 'all 0.2s ease',
          }}
          title="Open interactive 3D biological vitals hologram"
        >
          <Activity size={15} />
          <span>3D Vitals</span>
        </button>

        {/* AI Copilot Button */}
        <button
          id="btn-open-ai-copilot"
          onClick={() => {
            soundFX.playChime();
            onOpenCopilot();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #7B73F6 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 700,
            padding: '0 16px',
            height: '42px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(123, 115, 246, 0.35)',
            transition: 'all 0.2s ease',
          }}
          title="Open AI Medical Copilot"
        >
          <Sparkles size={15} />
          <span>AI Copilot</span>
        </button>

        {/* Upload Action CTA */}
        <button
          id="btn-open-upload"
          className="btn-upload-primary"
          onClick={() => {
            soundFX.playChime();
            onOpenUpload();
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Upload Document</span>
        </button>

        {/* Doctor Mode Toggle Pill */}
        {onToggleDoctorMode && (
          <button
            onClick={() => {
              soundFX.playChime();
              onToggleDoctorMode();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 12px',
              height: '40px',
              borderRadius: '9999px',
              border: isDoctorMode ? '1.5px solid #10B981' : '1px solid #CBD5E1',
              backgroundColor: isDoctorMode ? '#ECFDF5' : '#FFFFFF',
              color: isDoctorMode ? '#059669' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle between Patient View and Doctor Review Portal"
          >
            <Stethoscope size={15} color={isDoctorMode ? '#10B981' : '#64748B'} />
            <span>{isDoctorMode ? 'Doctor View Active' : 'Switch to Doctor View'}</span>
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5EAF3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: audioEnabled ? '#4F46E5' : '#94A3B8',
          }}
          title={audioEnabled ? 'Sound Effects Active' : 'Sound Muted'}
        >
          {audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        {/* Notification Alert Bell */}
        <button
          id="btn-alert-bell"
          onClick={() => {
            soundFX.playChime();
            if (onOpenNotifications) {
              onOpenNotifications();
            } else {
              onAlertClick();
            }
          }}
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5EAF3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4B5563',
          }}
          title={`${unreadAlertCount} notifications & checkup reminders`}
        >
          <Bell size={17} />
          {unreadAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
              }}
            >
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* User / Family Profile Switcher Pill (PRD Stretch Feature #5) */}
        <div style={{ position: 'relative' }}>
          <div
            className="profile-pill"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="Switch Patient Profile / Family Member"
          >
            <div className="profile-avatar">
              {currentDisplayProfile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="profile-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{currentDisplayProfile.name}</span>
                <ChevronDown size={12} color="#64748B" />
              </div>
              <div className="profile-role">
                {currentDisplayProfile.relationship === 'self'
                  ? 'Self · Primary'
                  : currentDisplayProfile.relationship === 'mother'
                  ? 'Mother · Dependent'
                  : 'Child · Dependent'}
              </div>
            </div>
          </div>

          {/* Family Switcher Dropdown */}
          {isProfileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '240px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={13} />
                <span>Family Profiles (PRD Multi-Profile)</span>
              </div>

              {allProfiles.map((p) => {
                const isSelected = p.userId === currentDisplayProfile.userId;
                return (
                  <button
                    key={p.userId}
                    onClick={() => {
                      soundFX.playClick();
                      if (onSelectProfile) onSelectProfile(p);
                      setIsProfileDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSelected ? '#EEF2FF' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#4F46E5' : '#E2E8F0',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          fontSize: '11px',
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
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>{p.name}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                          {p.relationship === 'self' ? 'Self' : p.relationship} · {p.bloodGroup || 'B+'}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="#4F46E5" />}
                  </button>
                );
              })}

              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onNavigateSettings) onNavigateSettings();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '12px',
                    color: '#4F46E5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Settings size={13} />
                  <span>Manage Profiles & Consent</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
