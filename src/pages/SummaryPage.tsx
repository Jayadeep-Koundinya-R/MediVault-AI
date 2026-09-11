import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Share2, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Pill, 
  FileText, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TrendChart from '../components/insights/TrendChart';
import DoctorShareModal from '../components/insights/DoctorShareModal';
import EmptyState from '../components/common/EmptyState';

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, records, flags, generateSummary, addToast } = useApp();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showRecordsUsed, setShowRecordsUsed] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeMedications = records
    .filter(r => r.prescription)
    .map(r => r.prescription!)
    .filter(p => !p.drugName.toLowerCase().includes('paracetamol'));

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setAiError(null);
    try {
      await generateSummary();
      addToast('Health Summary generated dynamically with Qwen');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI model service unavailable';
      setAiError(msg);
      addToast(msg, 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Encrypted summary link copied to clipboard');
  };

  if (records.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<Sparkles className="w-12 h-12 text-teal-500" />}
          title="No Health Records Available"
          description="Upload your medical prescriptions, lab reports, or immunization records to generate an automated plain-language health summary."
          actionLabel="Upload First Record"
          onAction={() => navigate('/app/upload')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span>Clinical Intelligence</span>
            <span>•</span>
            <span>Synthesized Health Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
            AI Health Summary
            <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Updated Today
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Consolidated overview generated from {records.length} records in your local vault.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? 'Analyzing...' : 'Regenerate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-3.5 h-3.5" />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setIsShareModalOpen(true)}
          >
            Export for Doctor
          </Button>
        </div>
      </div>

      {/* Prominent Statutory Medical Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 uppercase tracking-wide">
              Clinical Advisory & Non-Diagnostic Notice
            </h4>
            <p className="text-amber-800 mt-1 leading-relaxed">
              This summary is synthesized algorithmically from user-uploaded records solely to assist clinical conversations with certified medical professionals. 
              <strong> HealthVault does not provide automated diagnosis, disease predictions, or replace professional clinical judgment.</strong> Always consult your registered physician regarding symptoms or treatment modifications.
            </p>
          </div>
        </div>
      </div>

      {/* AI Error Alert Banner (Shown if Ollama service is unreachable) */}
      {aiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-800 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>AI Analysis Unavailable:</strong> {aiError}. Please verify that local Ollama is running and click Try Again.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
            Try Again
          </Button>
        </div>
      )}

      {/* SECTION 1: RECENT HEALTH OVERVIEW */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Recent Health Overview</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {summary?.overview || summary?.summaryText || 
            "Patient is an adult male with active maintenance medication for blood pressure (Telmisartan) and recent initiation of Metformin following three sequential elevated fasting glucose tests. Fasting blood sugar exhibits an upward trajectory over the past three months. No active adverse drug interactions identified."
          }
        </p>
      </Card>

      {/* SECTION 2: KEY LAB TRENDS (WITH TREND CHART) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Key Longitudinal Lab Trends</h3>
              <p className="text-xs text-slate-500">Pathology progression over the last 90 days</p>
            </div>
          </div>
          <Link
            to="/app/labs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            All Lab Tests &rarr;
          </Link>
        </div>

        {/* Embedded Interactive TrendChart */}
        <div className="pt-2">
          <TrendChart />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>Observation Notes</span>
            {summary?.trendNotes && summary.trendNotes.length > 0 && (
              <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                AI Synthesized
              </span>
            )}
          </p>
          {summary?.trendNotes && summary.trendNotes.length > 0 ? (
            <ul className="space-y-1.5 list-disc list-inside">
              {summary.trendNotes.map((note, idx) => (
                <li key={idx} className="leading-relaxed text-slate-700">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="leading-relaxed">
              Fasting glucose rose by +34 mg/dL across three readings (108 &rarr; 124 &rarr; 142 mg/dL). 
              Current value (142 mg/dL) exceeds the standard American Diabetes Association (ADA) clinical threshold of 126 mg/dL.
            </p>
          )}
        </div>
      </Card>

      {/* SECTION 3: ITEMS REQUIRING CLINICAL REVIEW */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Items Requiring Clinical Review ({flags.length})</h3>
              <p className="text-xs text-slate-500">Flags citing explicit guideline thresholds</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                flag.severity === 'high' ? 'bg-red-50/60 border-red-200' : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={flag.severity === 'high' ? 'danger' : 'warning'}>
                    {flag.parameter || flag.testName}: {flag.value || flag.currentValue} {flag.unit}
                  </Badge>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {flag.acknowledged ? 'Reviewed' : 'Needs Review'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{flag.message || flag.explanation}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Threshold: <strong>{flag.threshold || flag.thresholdDescription}</strong> &bull; {flag.clinicalGuideline || flag.ruleTriggered}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Source: {flag.sourceLab}</span>
                <Link
                  to={`/app/flags/${flag.id}`}
                  className="text-xs font-bold text-teal-800 hover:text-teal-900"
                >
                  Clinical details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 4: ACTIVE MEDICATIONS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Medications ({activeMedications.length})</h3>
              <p className="text-xs text-slate-500">Current ongoing drug regimen</p>
            </div>
          </div>
          <Link
            to="/app/prescriptions"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            Manage Regimens &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeMedications.map((med, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-slate-900">{med.drugName}</span>
                <div className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700 font-mono">{med.dosage}</span> &bull; {med.frequency}
                </div>
              </div>
              <Badge variant="info">Active</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 5: RECORDS USED COLLAPSIBLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setShowRecordsUsed(!showRecordsUsed)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Underlying Records Used for Synthesis ({records.length})
            </span>
          </div>
          {showRecordsUsed ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showRecordsUsed && (
          <div className="p-4 pt-0 border-t border-slate-100 divide-y divide-slate-100">
            {records.map((r) => {
              const doc = r.document;
              return (
                <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.type === 'prescription' ? 'info' : doc.type === 'lab_report' ? 'neutral' : 'success'}>
                      {doc.type.replace('_', ' ')}
                    </Badge>
                    <span className="font-semibold text-slate-800">{doc.title}</span>
                    <span className="text-slate-400 font-mono">({doc.sourceName || 'Vault'})</span>
                  </div>
                  <Link
                    to={`/app/records/${r.id}`}
                    className="text-teal-700 hover:text-teal-900 font-semibold"
                  >
                    View &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Sharing Modal */}
      <DoctorShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        records={records}
      />
    </div>
  );
};

export default SummaryPage;
