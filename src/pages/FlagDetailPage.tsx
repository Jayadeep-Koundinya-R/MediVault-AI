import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Building2, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const FlagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flags, acknowledgeFlag, addToast } = useApp();

  const flag = flags.find(f => f.id === id);

  if (!flag) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Clinical Alert Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The requested biomarker flag does not exist or has been dismissed.
        </p>
        <Button variant="primary" onClick={() => navigate('/app/summary')}>
          Back to Health Summary
        </Button>
      </div>
    );
  }

  const handleToggleReviewed = () => {
    acknowledgeFlag(flag.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Previous View</span>
        </button>
      </div>

      {/* Main Flag Header */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl shrink-0 ${
              flag.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={flag.severity === 'high' ? 'danger' : 'warning'}>
                  {flag.severity === 'high' ? 'Attention Needed' : 'Clinical Caution'}
                </Badge>
                <Badge variant={flag.status === 'reviewed' ? 'success' : 'neutral'}>
                  {flag.status === 'reviewed' ? 'Status: Reviewed by User' : 'Status: Unreviewed'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {flag.parameter || flag.testName}: {flag.value || flag.currentValue} {flag.unit}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Observed on {new Date(flag.date || flag.flaggedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {flag.sourceLab}
              </p>
            </div>
          </div>

          <Button
            variant={flag.status === 'reviewed' ? 'outline' : 'primary'}
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleToggleReviewed}
          >
            {flag.status === 'reviewed' ? 'Mark Unreviewed' : 'Mark as Reviewed'}
          </Button>
        </div>

        {/* Explainable Threshold Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-teal-700" />
            Clinical Threshold Citation
          </span>
          <p className="text-sm font-semibold text-slate-900">
            {flag.message || flag.explanation}
          </p>
          <div className="text-xs text-slate-600 space-y-1 pt-1">
            <div>
              <span className="font-semibold text-slate-700">Clinical Reference Threshold:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{flag.threshold || flag.thresholdDescription}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Evidence Guideline:</span>{' '}
              <span>{flag.clinicalGuideline || flag.ruleTriggered}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Trend Progression */}
      {(flag.parameter || flag.testName || '').toLowerCase().includes('glucose') && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Sequential Progression Over Time
          </h3>
          <p className="text-xs text-slate-600">
            This flag is generated because of 3 sequential tests demonstrating a rising trajectory:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-400 font-mono block">10 Jun 2026</span>
              <span className="text-xl font-bold font-mono text-slate-900">108 <span className="text-xs text-slate-500 font-normal">mg/dL</span></span>
              <span className="text-[11px] text-emerald-700 block font-medium mt-1">Normal Range</span>
            </div>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[11px] text-slate-400 font-mono block">20 Jul 2026</span>
              <span className="text-xl font-bold font-mono text-amber-900">124 <span className="text-xs text-slate-500 font-normal">mg/dL</span></span>
              <span className="text-[11px] text-amber-700 block font-medium mt-1">Borderline / Pre-diabetic</span>
            </div>
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-[11px] text-slate-400 font-mono block">18 Aug 2026 (Latest)</span>
              <span className="text-xl font-bold font-mono text-red-900">142 <span className="text-xs text-slate-500 font-normal">mg/dL</span></span>
              <span className="text-[11px] text-red-700 block font-medium mt-1">Elevated (&ge;126 ADA)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Questions for Your Doctor */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-700" />
          Recommended Questions for Your Doctor
        </h3>
        <p className="text-xs text-slate-600">
          Prepare for your next clinical appointment with these evidence-based discussion points:
        </p>

        <div className="space-y-2.5">
          <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg text-xs text-slate-800 font-medium flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>&ldquo;Given that my fasting blood sugar rose from 108 to 142 mg/dL across three tests, do you recommend an HbA1c test or oral glucose tolerance test?&rdquo;</span>
          </div>
          <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg text-xs text-slate-800 font-medium flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>&ldquo;Should we adjust my nutrition or physical activity plan before considering oral hypoglycemic medications?&rdquo;</span>
          </div>
          <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg text-xs text-slate-800 font-medium flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>&ldquo;How frequently should I log fasting and post-prandial blood glucose at home?&rdquo;</span>
          </div>
        </div>
      </Card>

      {/* Source Link */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
        <div>
          <span className="text-xs font-semibold text-slate-700 block">Underlying Pathology Document</span>
          <span className="text-xs text-slate-500 font-mono">Report ID: {flag.recordId} &bull; {flag.sourceLab}</span>
        </div>
        <Link
          to={`/app/records/${flag.recordId}`}
          className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          View Source Report <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
        <strong>Important Clinical Notice:</strong> MediVault flags are strictly rule-based threshold indicators designed to empower patient-physician dialogue. They do not constitute a medical diagnosis, risk prediction, or prescription recommendation.
      </div>
    </div>
  );
};

export default FlagDetailPage;
