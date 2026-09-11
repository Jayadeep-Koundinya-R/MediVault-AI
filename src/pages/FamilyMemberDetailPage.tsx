import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { familyService } from '../services/familyService';
import { 
  ArrowLeft, 
  Heart, 
  Check, 
  X, 
  FileText, 
  Activity, 
  Pill, 
  Syringe, 
  AlertTriangle,
  Settings,
  Lock
} from 'lucide-react';

export const FamilyMemberDetailPage: React.FC = () => {
  const { id: familyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [relationship, setRelationship] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<any | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermsModal, setShowPermsModal] = useState(false);

  // Permissions state for editing
  const [shareSummary, setShareSummary] = useState(false);
  const [shareLabs, setShareLabs] = useState(false);
  const [sharePrescriptions, setSharePrescriptions] = useState(false);
  const [shareVaccinations, setShareVaccinations] = useState(false);
  const [shareFlags, setShareFlags] = useState(false);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const loadData = async () => {
    if (!familyId) return;
    setIsLoading(true);
    try {
      const res = await familyService.getFamilyMemberDetail(familyId);
      setRelationship(res.relationship);
      setPermissions(res.permissions);
      setData(res.data);

      if (res.permissions) {
        setShareSummary(res.permissions.shareSummary);
        setShareLabs(res.permissions.shareLabs);
        setSharePrescriptions(res.permissions.sharePrescriptions);
        setShareVaccinations(res.permissions.shareVaccinations);
        setShareFlags(res.permissions.shareFlags);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to load family member details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [familyId]);

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;

    setIsSavingPerms(true);
    try {
      await familyService.updateFamilyPermissions(familyId, {
        shareSummary,
        shareLabs,
        sharePrescriptions,
        shareVaccinations,
        shareFlags,
      });
      addToast('Family sharing permissions updated');
      setShowPermsModal(false);
      await loadData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update permissions', 'error');
    } finally {
      setIsSavingPerms(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Family member not found.</p>
        <button
          onClick={() => navigate('/app/family')}
          className="mt-3 text-cyan-600 font-bold hover:underline"
        >
          Back to Family
        </button>
      </div>
    );
  }

  const latestSummary = data?.summaries?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/family')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Family</span>
      </button>

      {/* Member Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 font-display font-extrabold text-xl flex items-center justify-center shadow-clinical-sm">
            <Heart size={26} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900">
              {relationship.member_name || relationship.memberName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {relationship.relationship_type || relationship.relationshipType} · Connected Family Member
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPermsModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
        >
          <Settings size={14} />
          <span>Manage Sharing</span>
        </button>
      </div>

      {/* Sharing Permissions Matrix Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-clinical-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Permitted Health Records
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className={`p-2 rounded-xl border flex items-center justify-between ${
            permissions?.shareSummary ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>AI Summary</span>
            {permissions?.shareSummary ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2 rounded-xl border flex items-center justify-between ${
            permissions?.shareLabs ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Labs</span>
            {permissions?.shareLabs ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2 rounded-xl border flex items-center justify-between ${
            permissions?.shareFlags ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Risk Flags</span>
            {permissions?.shareFlags ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2 rounded-xl border flex items-center justify-between ${
            permissions?.sharePrescriptions ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Prescriptions</span>
            {permissions?.sharePrescriptions ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2 rounded-xl border flex items-center justify-between ${
            permissions?.shareVaccinations ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Vaccinations</span>
            {permissions?.shareVaccinations ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>
        </div>
      </div>

      {/* AI Summary (if permitted) */}
      {permissions?.shareSummary && latestSummary ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <FileText size={16} className="text-brand-900" />
            <span>Shared AI Health Summary</span>
          </div>
          <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl leading-relaxed whitespace-pre-line">
            {latestSummary.summaryText}
          </p>
        </div>
      ) : null}

      {/* Labs & Flags (if permitted) */}
      {permissions?.shareLabs && data?.labResults && data.labResults.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <Activity size={16} className="text-cyan-600" />
            <span>Shared Laboratory Results</span>
          </div>
          <div className="space-y-2">
            {data.labResults.map((lab: any) => (
              <div key={lab.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{lab.test_name || lab.testName}</span>
                <span className="font-bold text-cyan-800">{lab.value} {lab.unit}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Prescriptions (if permitted) */}
      {permissions?.sharePrescriptions && data?.prescriptions && data.prescriptions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <Pill size={16} className="text-indigo-600" />
            <span>Shared Prescriptions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.prescriptions.map((rx: any) => (
              <div key={rx.id} className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs">
                <h4 className="font-bold text-slate-900 mb-0.5">{rx.drug_name || rx.drugName}</h4>
                <p className="text-slate-600">Dosage: {rx.dosage} · {rx.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Vaccinations (if permitted) */}
      {permissions?.shareVaccinations && data?.vaccinations && data.vaccinations.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <Syringe size={16} className="text-purple-600" />
            <span>Shared Vaccinations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.vaccinations.map((vax: any) => (
              <div key={vax.id} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs">
                <h4 className="font-bold text-slate-900 mb-0.5">{vax.vaccine_name || vax.vaccineName}</h4>
                <p className="text-slate-600">Administered: {vax.date_administered || vax.dateAdministered}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Permissions Modal */}
      {showPermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Configure Family Sharing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose what health data is shared between you and {relationship.member_name || relationship.memberName}.
              </p>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                <span>Share AI Health Summary</span>
                <input
                  type="checkbox"
                  checked={shareSummary}
                  onChange={(e) => setShareSummary(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                <span>Share Lab Results</span>
                <input
                  type="checkbox"
                  checked={shareLabs}
                  onChange={(e) => setShareLabs(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                <span>Share Risk Flags</span>
                <input
                  type="checkbox"
                  checked={shareFlags}
                  onChange={(e) => setShareFlags(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                <span>Share Prescriptions</span>
                <input
                  type="checkbox"
                  checked={sharePrescriptions}
                  onChange={(e) => setSharePrescriptions(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                <span>Share Vaccinations</span>
                <input
                  type="checkbox"
                  checked={shareVaccinations}
                  onChange={(e) => setShareVaccinations(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
              </label>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPermsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPerms}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors shadow-clinical-sm"
                >
                  {isSavingPerms ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
