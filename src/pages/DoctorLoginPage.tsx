import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Stethoscope, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDoctor, loginDemoDoctor } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPatientRedirect, setIsPatientRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPatientRedirect(false);
    setIsLoading(true);

    try {
      await loginDoctor(email, password);
      navigate('/doctor/dashboard');
    } catch (err: any) {
      const msg = err?.message || "We couldn't log you in. Check your email and password.";
      setError(msg);
      if (msg.includes('patient account')) {
        setIsPatientRedirect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoDoctor = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await loginDemoDoctor();
      navigate('/doctor/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to login demo doctor.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-700/50 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mx-auto mb-3 shadow-clinical-md">
            <Stethoscope size={26} className="text-white" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold mb-2">
            <ShieldCheck size={12} className="text-cyan-600" />
            <span>HealthVault Clinical Portal</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">Doctor Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access connected patient records and review clinical summaries.
          </p>
        </div>

        {/* Demo Doctor Quick Launch */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-center">
          <p className="text-xs font-bold text-cyan-950 mb-1">
            Evaluating HealthVault Doctor Portal?
          </p>
          <p className="text-[11px] text-cyan-800 mb-2.5">
            Log in instantly with verified credentials:
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleDemoDoctor}
            isLoading={isDemoLoading}
            className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold"
            leftIcon={<Sparkles size={16} className="text-cyan-200" />}
          >
            Sign In as Dr. Ananya Rao (Verified ✓)
          </Button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
            or sign in with doctor email
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
            <p className="font-semibold">{error}</p>
            {isPatientRedirect && (
              <div className="mt-2.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="w-full text-xs font-bold"
                >
                  Go to Patient Login
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Doctor Email Address"
            type="email"
            placeholder="doctor@citycare.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-cyan-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign In to Doctor Portal
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col space-y-2 text-center text-xs text-slate-500">
          <div>
            New healthcare provider?{' '}
            <Link to="/doctor/signup" className="font-bold text-cyan-700 hover:underline">
              Create doctor account
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/login" className="font-semibold text-slate-600 hover:underline">
              Are you a patient? Sign in to patient vault here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
