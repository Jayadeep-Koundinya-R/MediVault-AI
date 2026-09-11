import React, { useState } from 'react';
import { Search, Plus, ShieldCheck, Bell, Sparkles, Activity, Volume2, VolumeX } from 'lucide-react';
import { User } from '../types';
import { soundFX } from '../utils/audioEffects';

interface TopNavProps {
  user: User;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenUpload: () => void;
  onOpenConsent: () => void;
  onOpenHologram: () => void;
  onOpenCopilot: () => void;
  unreadAlertCount: number;
  onAlertClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenConsent,
  onOpenHologram,
  onOpenCopilot,
  unreadAlertCount,
  onAlertClick,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleSound = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playChime();
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
            soundFX.playAlertPulse();
            onAlertClick();
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
          title={`${unreadAlertCount} unacknowledged clinical risk flag`}
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

        {/* User Profile */}
        <div 
          className="profile-pill"
          onClick={onOpenConsent}
          title="Patient Profile & Consent Information"
        >
          <div className="profile-avatar">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-role">Age 42 · Male</div>
          </div>
        </div>
      </div>
    </header>
  );
};
