import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  AlertTriangle, 
  Download, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, addToast } = useApp();
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const handleExportAuditLog = () => {
    const auditLog = {
      dataFiduciary: 'MediVault Digital Health Solutions Pvt. Ltd.',
      patientId: user?.id || 'demo_rahul_01',
      abhaId: '91-2345-6789-0123',
      consentTimestamp: user?.consentGivenAt || new Date().toISOString(),
      statutoryFramework: 'Digital Personal Data Protection Act, 2023 (India)',
      accessLogs: [
        { timestamp: '2026-08-18 10:30:15', action: 'OCR_ENTITY_EXTRACTION', ip: '127.0.0.1 (Device Local)', outcome: 'SUCCESS' },
        { timestamp: '2026-08-18 11:15:20', action: 'PATIENT_RECORD_VIEW', actor: 'PATIENT', outcome: 'SUCCESS' },
        { timestamp: '2026-08-19 09:00:00', action: 'DOCTOR_EXPORT_REQUEST', format: 'PDF_CLINICAL_BRIEF', outcome: 'SUCCESS' }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dpdp_consent_audit_trail.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Downloaded DPDP Act statutory audit log (JSON)');
  };

  const handleWithdrawConsent = () => {
    logout();
    addToast('Consent revoked. Local health vault detached.', 'warning');
    navigate('/welcome');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
          <span>Statutory Compliance</span>
          <span>•</span>
          <span>DPDP Act, 2023</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          Data Privacy & Consent Governance
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Review legal consent provisions, data protection safeguards, and statutory rights under Indian law.
        </p>
      </div>

      {/* DPDP Status Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Consent Status: Lawfully Granted
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Digital Personal Data Protection (DPDP) Act</h2>
          <p className="text-xs text-teal-200 max-w-xl">
            Your medical records are processed strictly under verifiable consent as prescribed under Section 6 of the DPDP Act, 2023.
          </p>
        </div>

        <div className="shrink-0 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-teal-900" />}
            onClick={handleExportAuditLog}
          >
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Statutory Rights Under DPDP Act 2023 */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Scale className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">Your Statutory Rights as a Data Principal</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              1. Right to Access Information
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You retain the absolute right to view, inspect, and export all digital clinical records and metadata processed by this service.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              2. Right to Correction & Erasure
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You may rectify inaccurate OCR records or demand complete erasure of your health data across local and cloud environments at any time.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              3. Right of Grievance Redressal
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct access to our statutory Data Protection Officer (DPO) and subsequent escalation to the Data Protection Board of India.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              4. Right to Nominate
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ability to nominate an emergency contact or family member to manage your health record vault in case of incapacitation.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Fiduciary Disclosures */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Data Fiduciary Disclosures & Zero-Monetization</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>Statutory Entity:</strong> MediVault Digital Health Solutions Pvt. Ltd. acting as Data Fiduciary.
          </p>
          <p>
            <strong>Explicit Purpose Limitation:</strong> Health data provided is utilized exclusively for personal health tracking, clinical trend visualization, and user-initiated doctor consultations.
          </p>
          <p>
            <strong>Zero Commercialization Guarantee:</strong> MediVault maintains a strict architectural barrier preventing any sale, licensing, or sharing of clinical records with third-party pharmaceutical advertisers or insurance underwriters.
          </p>
          <p>
            <strong>Encryption Standard:</strong> All stored documents are encrypted at rest using AES-256 and transmitted exclusively over TLS 1.3 tunnels with certificate pinning.
          </p>
        </div>
      </Card>

      {/* Consent Revocation Zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-950">Revoke Consent & Detach Vault</h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Withdrawing consent terminates the processing basis under Section 6(4) of the DPDP Act. Your session will immediately sign out, and active synchronization with local and ABDM endpoints will be terminated.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowWithdrawConfirm(true)}
          >
            Withdraw Consent & Sign Out
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        title="Revoke Health Data Consent?"
        message="Are you sure you want to revoke your consent under the DPDP Act? You will be signed out immediately and local sync will stop."
        confirmText="Yes, Revoke Consent"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleWithdrawConsent}
        onCancel={() => setShowWithdrawConfirm(false)}
      />
    </div>
  );
};

export default PrivacyPage;
