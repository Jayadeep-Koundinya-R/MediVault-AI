import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Trash2, 
  Calendar, 
  Building2, 
  User, 
  Clock, 
  FileText, 
  FlaskConical, 
  Syringe, 
  AlertTriangle, 
  Bell, 
  Eye, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DocumentViewerModal from '../components/viewer/DocumentViewerModal';
import DoctorShareModal from '../components/insights/DoctorShareModal';
import ReminderModal from '../components/records/ReminderModal';

export const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records, flags, deleteRecord, addToast } = useApp();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedMedReminder, setSelectedMedReminder] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const record = records.find(r => r.id === id);

  if (!record) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Record Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The health document you requested does not exist or may have been removed from your local vault.
        </p>
        <Button variant="primary" onClick={() => navigate('/app/timeline')}>
          Back to Timeline
        </Button>
      </div>
    );
  }

  // Associated risk flags for this record
  const associatedFlags = flags.filter(f => f.recordId === record.id);

  const handleDelete = () => {
    deleteRecord(record.id);
    navigate('/app/timeline');
  };

  const getTypeIcon = () => {
    switch (record.type) {
      case 'lab_report':
        return <FlaskConical className="w-6 h-6 text-indigo-600" />;
      case 'prescription':
        return <FileText className="w-6 h-6 text-teal-700" />;
      case 'vaccination':
        return <Syringe className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl shrink-0 ${
              record.type === 'prescription' ? 'bg-teal-50 text-teal-700' :
              record.type === 'lab_report' ? 'bg-indigo-50 text-indigo-700' :
              'bg-emerald-50 text-emerald-700'
            }`}>
              {getTypeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={
                  record.type === 'prescription' ? 'info' :
                  record.type === 'lab_report' ? 'neutral' : 'success'
                }>
                  {record.type.replace('_', ' ').toUpperCase()}
                </Badge>
                {record.status === 'abnormal' && (
                  <Badge variant="warning">Abnormal Findings</Badge>
                )}
                {record.status === 'attention_needed' && (
                  <Badge variant="danger">Attention Needed</Badge>
                )}
                <span className="text-xs text-slate-400 font-mono">ID: {record.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {record.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {record.sourceName}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action to View Original Document */}
          {record.imageUrl && (
            <button
              onClick={() => setIsViewerOpen(true)}
              className="group flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all text-left shrink-0"
            >
              <div className="w-12 h-14 rounded bg-slate-100 overflow-hidden relative">
                <img
                  src={record.imageUrl}
                  alt="Original Document"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center text-white">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 group-hover:text-teal-800">Original Document</p>
                <p className="text-[11px] text-slate-500">Tap to inspect full scan</p>
              </div>
            </button>
          )}
        </div>
      </Card>

      {/* Associated Risk Flags Banner */}
      {associatedFlags.length > 0 && (
        <div className="space-y-3">
          {associatedFlags.map(flag => (
            <div
              key={flag.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                flag.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                  flag.severity === 'high' ? 'text-red-600' : 'text-amber-600'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Clinical Reference Alert
                    </h4>
                    <Badge variant={flag.severity === 'high' ? 'danger' : 'warning'}>
                      {flag.parameter}: {flag.value} {flag.unit}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {flag.message}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Threshold: <strong>{flag.threshold}</strong> &bull; Guideline: {flag.clinicalGuideline}
                  </p>
                </div>
              </div>

              <Link
                to={`/app/flags/${flag.id}`}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm shrink-0 text-center"
              >
                Why was this flagged? &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Category-Specific Clinical Data Section */}

      {/* 1. PRESCRIPTION DETAILS */}
      {record.prescription && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              Prescription Regimen Details
            </h3>
            <Badge variant="neutral">Verified Clinical Rx</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Prescribing Practitioner</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {record.prescription.prescribingDoctor}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Healthcare Facility / Clinic</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {record.prescription.sourceHospital}
              </span>
            </div>
          </div>

          {/* Medication Card */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Prescribed Drug</span>
                <h4 className="text-lg font-bold text-slate-900">{record.prescription.drugName}</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Bell className="w-3.5 h-3.5 text-teal-700" />}
                onClick={() => {
                  setSelectedMedReminder(record.prescription!.drugName);
                  setIsReminderModalOpen(true);
                }}
              >
                Set Medicine Reminder
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <span className="text-slate-500 block">Dosage Strength</span>
                <span className="font-semibold text-slate-800 text-sm font-mono">{record.prescription.dosage}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Dosing Schedule</span>
                <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {record.prescription.frequency}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Prescription Date</span>
                <span className="font-semibold text-slate-800 text-sm font-mono">{record.prescription.prescribedDate}</span>
              </div>
            </div>

            {record.prescription.instructions && (
              <div className="mt-3 p-3 bg-teal-50/50 rounded-lg text-xs border border-teal-100">
                <span className="font-bold text-teal-900 block mb-0.5">Clinical Directions:</span>
                <span className="text-slate-700">{record.prescription.instructions}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 2. LAB RESULTS TABLE */}
      {record.labResults && record.labResults.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                Laboratory Test Results ({record.labResults.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specimen analyzed by {record.sourceName} on {record.date}
              </p>
            </div>
            <Badge variant="neutral">Verified Pathology</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Test Parameter</th>
                  <th className="py-2.5 px-3">Measured Result</th>
                  <th className="py-2.5 px-3">Standard Reference Interval</th>
                  <th className="py-2.5 px-3 text-right">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.labResults.map((test, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {test.testName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {test.value}
                      </span>{' '}
                      <span className="text-slate-500 text-[11px]">{test.unit}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {test.referenceRangeText || `${test.referenceRangeLow}–${test.referenceRangeHigh} ${test.unit}`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        test.status === 'high' ? 'bg-red-100 text-red-800' :
                        test.status === 'low' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="font-bold text-slate-700">Non-Diagnostic Advisory:</span>
            <span>Reference intervals vary between laboratory testing methodologies. Consult your physician for clinical interpretation.</span>
          </div>
        </Card>
      )}

      {/* 3. VACCINATION RECORD DETAILS */}
      {record.vaccination && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-600" />
              Immunization Certificate Details
            </h3>
            <Badge variant="success">Completed Dose</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Vaccine Name</span>
                <span className="text-base font-bold text-slate-900">{record.vaccination.vaccineName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Dose Sequence</span>
                <span className="text-sm font-semibold text-slate-800">Dose #{record.vaccination.doseNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Administering Healthcare Facility</span>
                <span className="text-sm font-semibold text-slate-800">{record.vaccination.facility}</span>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-slate-500 block">Administration Date</span>
                <span className="text-sm font-bold font-mono text-slate-900">{record.vaccination.dateAdministered}</span>
              </div>
              {record.vaccination.nextDueDate && (
                <div>
                  <span className="text-xs text-slate-500 block">Next Booster Due</span>
                  <span className="text-sm font-bold font-mono text-emerald-700">{record.vaccination.nextDueDate}</span>
                </div>
              )}
              {record.vaccination.batchNumber && (
                <div>
                  <span className="text-xs text-slate-500 block">Manufacturer Batch / Lot</span>
                  <span className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded inline-block">
                    {record.vaccination.batchNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Audit & Compliance Metadata */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          Data Integrity & ABDM Linkage
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Storage Mode</span>
            <span className="font-semibold text-slate-800">Encrypted Local Vault</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Extraction Provenance</span>
            <span className="font-semibold text-slate-800">OCR Extracted &bull; User Verified</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">ABDM Consent Artifact</span>
            <span className="font-semibold text-emerald-700 font-mono">LINKED-HIP-2026</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={record.imageUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'}
        title={record.title}
      />

      <DoctorShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        records={[record]}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        medicineName={selectedMedReminder}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Health Record?"
        message="Are you sure you want to permanently delete this document from your HealthVault? Associated lab trends and risk flags will be recalculated."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default RecordDetailPage;
