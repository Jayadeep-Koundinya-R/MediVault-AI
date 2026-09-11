import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { Shield, FileText, Activity, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useApp();

  const handleDemoStart = async () => {
    await loginDemo();
    navigate('/app/home');
  };

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-clinical-sm">
            <Shield size={22} className="text-cyan-300" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-brand-900 leading-none">HealthVault</h1>
            <span className="text-[10px] text-slate-500 font-medium">Digital Health Record</span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="max-w-3xl w-full mx-auto text-center py-12 sm:py-16">
        {/* Compliance Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-trust-50 border border-trust-200 text-trust-700 text-xs font-semibold mb-6 shadow-clinical-sm">
          <ShieldCheck size={16} className="text-trust-600" />
          <span>India’s DPDP Act 2023 &amp; ABDM Compliant</span>
        </div>

        {/* Headlines */}
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-brand-900 tracking-tight leading-[1.15] mb-5">
          Your complete health history, in one place.
        </h2>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Upload prescriptions, lab reports and vaccination records. HealthVault organizes them into a clear timeline so you can understand and share your medical history more easily.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight size={18} />}
          >
            Get Started
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto"
          >
            I already have an account
          </Button>
        </div>

        {/* Quick Demo Bypass */}
        <div className="mb-14">
          <button
            onClick={handleDemoStart}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-brand-900 text-xs font-semibold border border-slate-300 transition-all shadow-clinical-sm"
          >
            <Sparkles size={15} className="text-cyan-600" />
            <span>Launch Seeded Demo Patient (Rahul Sharma)</span>
          </button>
        </div>

        {/* 3 Trust Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Secure by Design</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explicit health data consent step before storage under statutory DPDP privacy principles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">OCR-Powered Capture</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Digitize prescriptions and lab reports directly with graceful manual fallback for handwriting.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-trust-700 flex items-center justify-center mb-3">
              <Activity size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Explainable Insights</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Objective threshold-based risk flags citing published reference ranges. Never unexplainable black-box diagnosis.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>HealthVault • Digital Health Record Application • Devert-a-thon Healthcare Technology</p>
      </footer>
    </div>
  );
};
