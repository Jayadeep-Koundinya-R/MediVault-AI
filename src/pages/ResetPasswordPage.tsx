import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSuccess(true);
    addToast('Password has been successfully updated');
  };

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center mx-auto mb-3 shadow-clinical-sm">
            <Shield size={26} className="text-cyan-300" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-brand-900">Set New Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create a secure password for your MediVault account.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Update Password
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Password Updated</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your credentials have been securely refreshed.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Log in with New Password
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link to="/login" className="font-bold text-brand-900 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
