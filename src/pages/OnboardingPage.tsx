import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Lock, Heart, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { showToast } from '../components/Toast';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [showConsentDetails, setShowConsentDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim() && dob && email.trim() && password.length >= 6 && consentGranted;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      localStorage.setItem('medivault_user', JSON.stringify({
        name, dob, email, createdAt: new Date().toISOString(),
      }));
      localStorage.setItem('medivault_authenticated', 'true');
      showToast('success', 'Account Created!', 'Welcome to MediVault-AI. Your health vault is ready.');
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          {/* Animated Logo */}
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />
              <line x1="24" y1="12" x2="24" y2="36" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="12" y1="24" x2="36" y2="24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="4" fill="#F5A623" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#4F46E5" />
                  <stop offset="1" stopColor="#7B73F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="auth-brand-title">MediVault<span>-AI</span></h1>
          <p className="auth-brand-subtitle">
            Your personal AI-powered health record vault. Consolidate prescriptions, lab reports, and vaccination records across multiple hospitals.
          </p>

          {/* Feature highlights */}
          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(245, 166, 35, 0.15)', color: '#F5A623' }}>
                <Heart size={18} />
              </div>
              <div>
                <div className="auth-feature-title">OCR-Powered Digitization</div>
                <div className="auth-feature-desc">Scan prescriptions, lab reports & vaccination cards instantly</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="auth-feature-title">DPDP Act Compliant</div>
                <div className="auth-feature-desc">End-to-end encryption under India's data protection law</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="auth-feature-title">Clinical Risk Intelligence</div>
                <div className="auth-feature-desc">ADA/WHO threshold-based flags with cited reference ranges</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient gradient orb */}
        <div className="auth-brand-orb auth-brand-orb-1" />
        <div className="auth-brand-orb auth-brand-orb-2" />
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create your Health Vault</h2>
            <p>Start consolidating your medical records today</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* DOB */}
            <div className="form-group">
              <label htmlFor="signup-dob">Date of Birth</label>
              <input
                id="signup-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-password-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* DPDP Consent */}
            <div className="consent-section">
              <label className="consent-checkbox-row">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  id="dpdp-consent-check"
                />
                <span className="consent-label">
                  I consent to the processing of my health data under the
                  <strong> Digital Personal Data Protection (DPDP) Act, 2023</strong>
                </span>
              </label>

              <button
                type="button"
                className="consent-expand-btn"
                onClick={() => setShowConsentDetails(!showConsentDetails)}
              >
                {showConsentDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showConsentDetails ? 'Hide Details' : 'View Consent Details'}</span>
              </button>

              {showConsentDetails && (
                <div className="consent-details-panel">
                  <div className="consent-detail-item">
                    <Lock size={14} />
                    <span><strong>Purpose:</strong> Health records are processed to build your longitudinal health timeline and calculate clinical risk flags.</span>
                  </div>
                  <div className="consent-detail-item">
                    <ShieldCheck size={14} />
                    <span><strong>No Sharing:</strong> Data is never sold, shared with insurers, or used for advertising.</span>
                  </div>
                  <div className="consent-detail-item">
                    <CheckCircle2 size={14} />
                    <span><strong>Your Rights:</strong> Under Section 6, you can withdraw consent and request full data erasure at any time.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <span>Create My Health Vault</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-row">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="auth-switch-link">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
