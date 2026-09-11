import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordConsent } = useApp();
  const [consented, setConsented] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgree = async () => {
    if (!consented) return;
    setIsSubmitting(true);
    try {
      await recordConsent();
      navigate('/app/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        {/* Compliance Icon */}
        <div className="w-14 h-14 rounded-2xl bg-trust-50 text-trust-600 flex items-center justify-center mb-5 border border-trust-200 shadow-clinical-sm">
          <ShieldCheck size={32} />
        </div>

        {/* Heading */}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mb-3">
          Your health data deserves extra care.
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          MediVault stores sensitive personal health records such as prescriptions, diagnostic lab reports, and vaccination cards. Under <strong>India’s Digital Personal Data Protection (DPDP) Act, 2023</strong>, we require your explicit, informed consent prior to ingesting and processing these documents.
        </p>

        {/* DPDP Safeguards Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-3">
          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <Lock size={16} className="text-trust-600 mt-0.5 flex-shrink-0" />
            <span>Encrypted storage restricted exclusively to your authenticated account.</span>
          </div>
          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <FileText size={16} className="text-trust-600 mt-0.5 flex-shrink-0" />
            <span>Used only for optical character recognition (OCR), chronological indexing, and plain-language summary generation.</span>
          </div>
          <div className="flex items-start space-x-2.5 text-xs text-slate-700">
            <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Never sold, commercialized, or shared with third parties without your explicit command.</span>
          </div>
        </div>

        {/* Mandatory Checkbox - NOT pre-checked! */}
        <div className="p-4 rounded-2xl border-2 border-slate-300 bg-white hover:border-trust-600 transition-colors mb-6">
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-slate-400 text-trust-600 focus:ring-trust-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              I understand and consent to MediVault storing my health records for this application under DPDP statutory guidelines.
            </span>
          </label>
        </div>

        {/* Expandable Explanation: "Why do we need this?" */}
        <div className="mb-8 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-brand-900 py-1"
          >
            <span>Why do we need this?</span>
            {showWhy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showWhy && (
            <div className="mt-2 text-xs text-slate-500 leading-relaxed p-3 bg-slate-50 rounded-xl">
              Medical records constitute sensitive biometric data. Unlike standard websites, digital health applications in India and internationally adhere to strict consent frameworks to prevent unauthorized aggregation. Your consent acts as a verifiable cryptographic permission log which you can review or revoke at any time in Settings.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Go Back
          </Button>

          <Button
            variant="trust"
            size="lg"
            onClick={handleAgree}
            disabled={!consented}
            isLoading={isSubmitting}
            className="w-full sm:flex-1 order-1 sm:order-2"
          >
            Agree &amp; Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
