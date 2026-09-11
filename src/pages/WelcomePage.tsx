import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { Shield, FileText, Activity, ShieldCheck, ArrowRight, Sparkles, Stethoscope, UserCheck } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo, loginDemoDoctor } = useApp();

  const handleDemoPatient = async () => {
    await loginDemo();
    navigate('/app/home');
  };

  const handleDemoDoctor = async () => {
    await loginDemoDoctor();
    navigate('/doctor/dashboard');
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
            <h1 className="font-display font-extrabold text-xl text-brand-900 leading-none">MediVault</h1>
            <span className="text-[10px] text-slate-500 font-medium">Digital Health Record · Family &amp; Clinical Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Patient Log In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/doctor/login')}
            className="bg-brand-900 text-white hover:bg-brand-800"
          >
            Doctor Portal
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-3xl w-full mx-auto text-center py-10 sm:py-14">
        {/* Compliance Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-trust-50 border border-trust-200 text-trust-700 text-xs font-semibold mb-6 shadow-clinical-sm">
          <ShieldCheck size={16} className="text-trust-600" />
          <span>India’s DPDP Act 2023 &amp; ABDM Compliant</span>
        </div>

        {/* Headlines */}
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-brand-900 tracking-tight leading-[1.15] mb-5">
          Your health. One secure place.
        </h2>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Upload prescriptions, lab reports, and vaccination records. Consolidate your family’s health records and securely connect with trusted verified doctors.
        </p>

        {/* Patient Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-6">
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

        {/* Demo Patient Launcher */}
        <div className="mb-10">
          <button
            onClick={handleDemoPatient}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-brand-900 text-xs font-semibold border border-slate-300 transition-all shadow-clinical-sm"
          >
            <Sparkles size={15} className="text-cyan-600" />
            <span>Launch Seeded Demo Patient (Rahul Sharma)</span>
          </button>
        </div>

        {/* Distinct Doctor Entry Point */}
        <div className="max-w-xl mx-auto my-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-brand-900 text-white shadow-clinical-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Stethoscope size={100} />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Stethoscope size={14} />
              <span>Are you a doctor?</span>
            </div>
            
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-5 leading-relaxed">
              Manage your patients, review shared health reports, add clinical reviews with the Doctor Reviewed ★ badge, and communicate securely.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/doctor/login')}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none"
              >
                Doctor Sign In
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/doctor/signup')}
                className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600 font-medium"
              >
                Doctor Sign Up
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleDemoDoctor}
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
              >
                <UserCheck size={14} />
                <span>Launch Demo Doctor (Dr. Ananya Rao · Verified Doctor ✓)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Trust Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Family Health &amp; Privacy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage family records with a privacy-first permissions matrix. You decide exactly what is shared and can revoke access anytime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">OCR &amp; Dynamic AI</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Extract prescriptions and labs, analyze longitudinal trends with local Ollama + Qwen, and flag medical safety risks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-trust-700 flex items-center justify-center mb-3">
              <Activity size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Doctor Reviewed ★</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect with verified doctors, share summarized reports, receive clinical reviews with the blue-star badge, and chat directly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>MediVault 2.0 • Digital Health Record Application • Devert-a-thon Healthcare Technology</p>
      </footer>
    </div>
  );
};
