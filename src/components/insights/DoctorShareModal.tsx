import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { summaryService } from '../../services/summaryService';
import { CheckSquare, Square, Copy, Download, Share2, CheckCircle2 } from 'lucide-react';

import { UnifiedRecord } from '../../types';

export interface DoctorShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: UnifiedRecord[];
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  isOpen,
  onClose,
  records: propRecords
}) => {
  const { user, summary, records: ctxRecords, addToast } = useApp();
  const records = propRecords || ctxRecords;

  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includePrescriptions, setIncludePrescriptions] = useState(true);
  const [includeVaccines, setIncludeVaccines] = useState(false);
  const [includeDocs, setIncludeDocs] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  if (!isOpen) return null;

  const handlePrepare = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsReady(true);
    }, 900);
  };

  const getExportText = () => {
    return summaryService.formatDoctorExportText({
      userName: user?.name || 'Patient',
      dob: user?.dateOfBirth || '2002-08-14',
      summary,
      records,
      includeSummary,
      includeLabs,
      includePrescriptions,
      includeVaccines
    });
  };

  const handleCopyText = () => {
    const text = getExportText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast('Doctor summary copied to clipboard');
    } else {
      addToast('Summary ready to copy');
    }
  };

  const handleDownloadPDF = () => {
    const text = getExportText();
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `HealthVault_Clinical_Summary_${user?.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Clinical report file downloaded');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsReady(false);
        onClose();
      }}
      title="Share with your doctor"
      subtitle="Assemble an organized, explainable clinical summary to bring to your consultation."
      maxWidth="lg"
    >
      {!isReady ? (
        <div className="space-y-5">
          {/* Patient Overview Header Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">{user?.name}</span>
              <span className="text-slate-500">DOB: {user?.dateOfBirth} • ABHA: {user?.abhaId}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-trust-50 text-trust-700 font-semibold text-[11px] border border-trust-200">
              DPDP Validated
            </span>
          </div>

          {/* Selectable Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select Sections to Include:
            </h5>
            <div className="space-y-2">
              <label 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setIncludeSummary(!includeSummary)}
              >
                <div className="flex items-center space-x-3">
                  {includeSummary ? <CheckSquare size={18} className="text-brand-900" /> : <Square size={18} className="text-slate-400" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">AI-Assisted Health Summary &amp; Trends</span>
                    <span className="text-[11px] text-slate-500">Plain-language trend overview and flagged risk thresholds</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">1 summary</span>
              </label>

              <label 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setIncludeLabs(!includeLabs)}
              >
                <div className="flex items-center space-x-3">
                  {includeLabs ? <CheckSquare size={18} className="text-brand-900" /> : <Square size={18} className="text-slate-400" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Laboratory Results &amp; Reference Ranges</span>
                    <span className="text-[11px] text-slate-500">Includes Fasting Glucose, HbA1c, and Lipid panel</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">6 tests</span>
              </label>

              <label 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setIncludePrescriptions(!includePrescriptions)}
              >
                <div className="flex items-center space-x-3">
                  {includePrescriptions ? <CheckSquare size={18} className="text-brand-900" /> : <Square size={18} className="text-slate-400" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Active Prescriptions &amp; Dosages</span>
                    <span className="text-[11px] text-slate-500">Metformin, Paracetamol, Vitamin D3, Telmisartan</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">4 meds</span>
              </label>

              <label 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setIncludeVaccines(!includeVaccines)}
              >
                <div className="flex items-center space-x-3">
                  {includeVaccines ? <CheckSquare size={18} className="text-brand-900" /> : <Square size={18} className="text-slate-400" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Vaccination History</span>
                    <span className="text-[11px] text-slate-500">Influenza and COVID-19 booster records</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">2 doses</span>
              </label>

              <label 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setIncludeDocs(!includeDocs)}
              >
                <div className="flex items-center space-x-3">
                  {includeDocs ? <CheckSquare size={18} className="text-brand-900" /> : <Square size={18} className="text-slate-400" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Original Scanned Document Attachments</span>
                    <span className="text-[11px] text-slate-500">High-resolution photographic scans for clinical inspection</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">12 files</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handlePrepare}
            variant="primary"
            isLoading={isGenerating}
            className="w-full"
            size="lg"
          >
            Create Shareable Summary
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
            <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-bold text-emerald-950">Summary ready to share</h5>
              <p className="text-xs text-emerald-800">
                Your structured clinical summary is formatted and ready for your physician.
              </p>
            </div>
          </div>

          {/* Text Preview Box */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
            {getExportText()}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleCopyText}
              variant="secondary"
              leftIcon={<Copy size={16} />}
              className="w-full"
            >
              Copy Summary
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="primary"
              leftIcon={<Download size={16} />}
              className="w-full"
            >
              Share as PDF
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DoctorShareModal;
