import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { showToast } from '../components/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim() && password.length >= 1;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      localStorage.setItem('medivault_authenticated', 'true');
      if (!localStorage.getItem('medivault_user')) {
        localStorage.setItem('medivault_user', JSON.stringify({
          name: 'Rahul Sharma', dob: '1984-03-15', email,
          createdAt: new Date().toISOString(),
        }));
      }
      showToast('success', 'Welcome Back!', 'Your health vault is ready.');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="url(#logoGrad2)" />
              <line x1="24" y1="12" x2="24" y2="36" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="12" y1="24" x2="36" y2="24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="4" fill="#F5A623" />
              <defs>
                <linearGradient id="logoGrad2" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#4F46E5" />
                  <stop offset="1" stopColor="#7B73F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="auth-brand-title">MediVault<span>-AI</span></h1>
          <p className="auth-brand-subtitle">
            Welcome back. Access your consolidated health records across Apollo, Fortis, Max Healthcare, and more.
          </p>

          {/* Trust badges */}
          <div className="auth-trust-badges">
            <div className="auth-trust-badge">
              <ShieldCheck size={16} />
              <span>DPDP Act Compliant</span>
            </div>
            <div className="auth-trust-badge">
              <ShieldCheck size={16} />
              <span>256-bit AES Encryption</span>
            </div>
            <div className="auth-trust-badge">
              <ShieldCheck size={16} />
              <span>Zero Data Sharing</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-orb auth-brand-orb-1" />
        <div className="auth-brand-orb auth-brand-orb-2" />
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign in to MediVault</h2>
            <p>Enter your credentials to access your health records</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            <div className="login-options-row">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-password-link" onClick={() => showToast('info', 'Password Reset', 'Check your email for a reset link.')}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-row">
            Don't have an account?{' '}
            <button onClick={() => navigate('/')} className="auth-switch-link">
              Create Health Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
