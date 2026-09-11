import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { doctorService } from '../services/doctorService';
import { DoctorPatientRelationship } from '../types';
import { ArrowLeft, Shield, Check, Lock, AlertTriangle, UserMinus } from 'lucide-react';

export const DoctorSharingPreferencesPage: React.FC = () => {
  const { id: relationshipId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useApp();

  const [relationship, setRelationship] = useState<DoctorPatientRelationship | null>(
    (location.state as any)?.relationship || null
  );
  const [shareSummary, setShareSummary] = useState(true);
  const [shareLabs, setShareLabs] = useState(false);
  const [sharePrescriptions, setSharePrescriptions] = useState(false);
  const [shareVaccinations, setShareVaccinations] = useState(false);
  const [shareOriginalDocuments, setShareOriginalDocuments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    if (relationship?.permissions) {
      setShareSummary(relationship.permissions.shareSummary);
      setShareLabs(relationship.permissions.shareLabs);
      setSharePrescriptions(relationship.permissions.sharePrescriptions);
      setShareVaccinations(relationship.permissions.shareVaccinations);
      setShareOriginalDocuments(relationship.permissions.shareOriginalDocuments);
    }
  }, [relationship]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relationshipId) return;

    setIsSaving(true);
    try {
      await doctorService.updateRequestStatus({
        requestId: relationshipId,
        permissions: {
          shareSummary,
          shareLabs,
          sharePrescriptions,
          shareVaccinations,
          shareOriginalDocuments,
        },
      });
      addToast('Sharing preferences saved successfully.');
      navigate('/app/doctors');
    } catch (err: any) {
      addToast(err?.message || 'Failed to save sharing preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!relationshipId) return;
    setIsRevoking(true);
    try {
      await doctorService.updateRequestStatus({
        requestId: relationshipId,
        status: 'revoked',
      });
      addToast('Doctor access revoked immediately.');
      setShowRevokeModal(false);
      navigate('/app/doctors');
    } catch (err: any) {
      addToast(err?.message || 'Failed to revoke access', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  const doctorName = relationship?.doctorProfile?.fullName || 'Your Doctor';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <button
        onClick={() => navigate('/app/doctors')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Trusted Doctors</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-2">
            <Lock size={12} className="text-cyan-600" />
            <span>Privacy-First Sharing</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            What can {doctorName} see?
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control exactly which parts of your medical record are accessible to this physician.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* AI Summary */}
          <label className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                AI Health Summary
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Allows the doctor to review your longitudinal health summary and award clinical review notes.
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareSummary}
              onChange={(e) => setShareSummary(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </label>

          {/* Lab Results */}
          <label className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                Lab Results &amp; Risk Flags
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Allows the doctor to inspect specific quantitative biomarker tests and threshold evaluations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareLabs}
              onChange={(e) => setShareLabs(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </label>

          {/* Prescriptions */}
          <label className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                Prescriptions &amp; Medications
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Allows the doctor to view your active drug regimen, dosages, and prescribing history.
              </span>
            </div>
            <input
              type="checkbox"
              checked={sharePrescriptions}
              onChange={(e) => setSharePrescriptions(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </label>

          {/* Vaccinations */}
          <label className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                Vaccination Records
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Allows the doctor to see your immunization history and upcoming booster due dates.
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareVaccinations}
              onChange={(e) => setShareVaccinations(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </label>

          {/* Original Documents */}
          <label className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                Original Uploaded Documents
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Allows the doctor to view raw uploaded scans or photos of your physical documents.
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareOriginalDocuments}
              onChange={(e) => setShareOriginalDocuments(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </label>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowRevokeModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <UserMinus size={15} />
              <span>Remove Trusted Doctor</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors shadow-clinical-sm"
            >
              {isSaving ? 'Saving...' : 'Save Sharing Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Revocation Confirmation Modal (Prompt Section 21) */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-display font-extrabold text-lg text-slate-900">
                Remove access?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This doctor will no longer be able to view the health information you shared through MediVault.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-clinical-sm"
              >
                {isRevoking ? 'Removing...' : 'Remove Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
