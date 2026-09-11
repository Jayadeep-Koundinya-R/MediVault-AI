import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Shield, Sparkles, ArrowRight, Stethoscope } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDoctorRedirect, setIsDoctorRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDoctorRedirect(false);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app/home');
    } catch (err: any) {
      const msg = err?.message || "We couldn't log you in. Check your email and password and try again.";
      setError(msg);
      if (msg.includes('doctor account') || msg.includes('Doctor Sign In')) {
        setIsDoctorRedirect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await loginDemo();
      navigate('/app/home');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center mx-auto mb-3 shadow-clinical-sm">
            <Shield size={26} className="text-cyan-300" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-brand-900">Patient Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your consolidated health records timeline.
          </p>
        </div>

        {/* Demo Account Button */}
        <div className="mb-6 p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 text-center">
          <p className="text-xs font-semibold text-brand-900 mb-2">
            Evaluating HealthVault for Devert-a-thon?
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleDemoLogin}
            isLoading={isDemoLoading}
            className="w-full bg-brand-900 hover:bg-brand-800"
            leftIcon={<Sparkles size={16} className="text-cyan-300" />}
          >
            Use Demo Account (Rahul Sharma)
          </Button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
            <p className="font-medium">{error}</p>
            {isDoctorRedirect && (
              <div className="mt-2.5">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/doctor/login')}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                  leftIcon={<Stethoscope size={14} />}
                >
                  Go to Doctor Portal
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-900 hover:underline">
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
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Log In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col space-y-2 text-center text-xs text-slate-500">
          <div>
            Don’t have an account yet?{' '}
            <Link to="/signup" className="font-bold text-brand-900 hover:underline">
              Create patient account
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/doctor/login" className="font-semibold text-cyan-700 hover:underline inline-flex items-center space-x-1">
              <Stethoscope size={13} />
              <span>Are you a doctor? Sign in here</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
