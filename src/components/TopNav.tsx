import React from 'react';
import { Search, Plus, ShieldCheck, Bell } from 'lucide-react';
import { User } from '../types';

interface TopNavProps {
  user: User;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenUpload: () => void;
  onOpenConsent: () => void;
  unreadAlertCount: number;
  onAlertClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenConsent,
  unreadAlertCount,
  onAlertClick,
}) => {
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

        {/* Upload Action CTA */}
        <button 
          id="btn-open-upload"
          className="btn-upload-primary" 
          onClick={onOpenUpload}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Upload Document</span>
        </button>

        {/* Notification Alert Bell */}
        <button
          id="btn-alert-bell"
          onClick={onAlertClick}
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
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
          <Bell size={18} />
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
