import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Shield, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center mx-auto mb-3 shadow-clinical-sm">
            <Shield size={26} className="text-cyan-300" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-brand-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive secure recovery instructions.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email Address"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={18} />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Check your inbox</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                We simulated sending a password reset link to <strong>{email}</strong>. Follow the link in the message to select a new password.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/reset-password')}
              className="w-full"
            >
              Proceed to Password Reset
            </Button>
          </div>
        )}

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-900"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
