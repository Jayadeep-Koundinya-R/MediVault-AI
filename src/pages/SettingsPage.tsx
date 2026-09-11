import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ShieldCheck, Volume2, Download, Trash2,
  LogOut, Lock, Bell, Moon, Sun, CheckCircle2, AlertCircle
} from 'lucide-react';
import { currentUser } from '../data/mockHealthData';
import { showToast } from '../components/Toast';
import { soundFX } from '../utils/audioEffects';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [consentActive, setConsentActive] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playChime();
    showToast('info', next ? 'Sound Enabled' : 'Sound Muted');
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({
      patient: currentUser,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medivault_patient_export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data Exported', 'Patient data saved as JSON');
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all your health data? This action cannot be undone.')) {
      showToast('error', 'Data Deleted', 'All patient records have been purged');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medivault_authenticated');
    showToast('info', 'Signed Out', 'You have been logged out');
    navigate('/login');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your profile, privacy, and app preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <User size={18} />
            <span>Patient Profile</span>
          </div>
          <div className="settings-profile">
            <div className="settings-avatar">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="settings-profile-info">
              <div className="settings-profile-name">{currentUser.name}</div>
              <div className="settings-profile-detail">DOB: {new Date(currentUser.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div className="settings-profile-detail">ID: {currentUser.userId}</div>
              <div className="settings-profile-detail">Member since {new Date(currentUser.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Privacy & Consent */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <ShieldCheck size={18} />
            <span>Privacy & Consent (DPDP Act)</span>
          </div>
          <div className="settings-toggle-list">
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">Health Data Consent</div>
                <div className="settings-toggle-desc">Allow processing of medical records for timeline & risk flags</div>
              </div>
              <button
                className={`settings-toggle-btn ${consentActive ? 'active' : ''}`}
                onClick={() => {
                  setConsentActive(!consentActive);
                  showToast(consentActive ? 'error' : 'success',
                    consentActive ? 'Consent Withdrawn' : 'Consent Granted',
                    consentActive ? 'Your data will no longer be processed' : 'Health data processing is active');
                }}
              >
                <div className="settings-toggle-knob" />
              </button>
            </div>

            <div className="settings-divider" />

            <div className="settings-action-row">
              <button className="settings-action-btn" onClick={handleExportData}>
                <Download size={16} />
                <span>Export All Data (JSON)</span>
              </button>
              <button className="settings-action-btn danger" onClick={handleDeleteData}>
                <Trash2 size={16} />
                <span>Delete All Data</span>
              </button>
            </div>

            <div className="settings-consent-status">
              {consentActive ? (
                <div className="settings-consent-active">
                  <CheckCircle2 size={14} />
                  <span>Consent is active · Data encrypted at rest (AES-256)</span>
                </div>
              ) : (
                <div className="settings-consent-inactive">
                  <AlertCircle size={14} />
                  <span>Consent withdrawn · Data processing suspended</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <Bell size={18} />
            <span>App Preferences</span>
          </div>
          <div className="settings-toggle-list">
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">
                  <Volume2 size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Sound Effects
                </div>
                <div className="settings-toggle-desc">Play audio feedback on interactions</div>
              </div>
              <button
                className={`settings-toggle-btn ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
              >
                <div className="settings-toggle-knob" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">
                  <Bell size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Risk Flag Notifications
                </div>
                <div className="settings-toggle-desc">Alert when lab values cross clinical thresholds</div>
              </div>
              <button
                className={`settings-toggle-btn ${notifications ? 'active' : ''}`}
                onClick={() => {
                  setNotifications(!notifications);
                  showToast('info', notifications ? 'Notifications Disabled' : 'Notifications Enabled');
                }}
              >
                <div className="settings-toggle-knob" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-label">
                  {darkMode ? <Moon size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> : <Sun size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />}
                  Dark Mode
                </div>
                <div className="settings-toggle-desc">Switch between light and dark themes</div>
              </div>
              <button
                className={`settings-toggle-btn ${darkMode ? 'active' : ''}`}
                onClick={() => {
                  setDarkMode(!darkMode);
                  showToast('info', 'Theme Coming Soon', 'Dark mode will be available in the next update');
                }}
              >
                <div className="settings-toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        {/* About & Logout */}
        <div className="ui-card settings-card">
          <div className="settings-card-header">
            <Lock size={18} />
            <span>About & Session</span>
          </div>
          <div className="settings-about">
            <div className="settings-about-row">
              <span>App Version</span>
              <span className="settings-about-value">MediVault-AI v1.0.0</span>
            </div>
            <div className="settings-about-row">
              <span>Hackathon</span>
              <span className="settings-about-value">Devert-a-thon (DVPS24)</span>
            </div>
            <div className="settings-about-row">
              <span>Compliance</span>
              <span className="settings-about-value">DPDP Act 2023</span>
            </div>
            <div className="settings-about-row">
              <span>OCR Engine</span>
              <span className="settings-about-value">Google ML Kit</span>
            </div>
          </div>

          <button className="settings-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
