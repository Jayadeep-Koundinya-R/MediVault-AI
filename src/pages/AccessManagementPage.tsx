import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Lock, 
  Stethoscope, 
  Heart, 
  Check, 
  X, 
  Clock, 
  Settings, 
  ArrowLeft,
  FileText
} from 'lucide-react';

export const AccessManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [data, setData] = useState<{
    trustedDoctors: any[];
    familyMembers: any[];
    accessLogs: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccessData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/access', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.warn('Load access data note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccessData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/settings')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Settings</span>
      </button>

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-2">
          <Shield size={12} className="text-cyan-600" />
          <span>Access Control &amp; Privacy Audit</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900">
          Who has access to my data?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review which physicians and family members can view your health vault, inspect what is shared, and view an audit trail of access events.
        </p>
      </div>

      {/* SECTION 1: TRUSTED DOCTORS (Prompt Section 95) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Stethoscope size={18} className="text-cyan-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Trusted Doctors ({data?.trustedDoctors?.length || 0})
            </h2>
          </div>
          <button
            onClick={() => navigate('/app/doctors')}
            className="text-xs font-bold text-cyan-700 hover:underline"
          >
            Manage Doctors &rarr;
          </button>
        </div>

        {data?.trustedDoctors && data.trustedDoctors.length > 0 ? (
          <div className="space-y-4">
            {data.trustedDoctors.map((doc) => (
              <div key={doc.relationshipId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{doc.doctorName}</h3>
                    <p className="text-[11px] text-slate-500">{doc.specialization} · {doc.clinicName}</p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Last accessed:{' '}
                    <strong>
                      {doc.lastAccessedAt
                        ? new Date(doc.lastAccessedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Never'}
                    </strong>
                  </span>
                </div>

                {/* Permissions Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>AI Summary</span>
                    {doc.shareSummary ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Labs</span>
                    {doc.shareLabs ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Prescriptions</span>
                    {doc.sharePrescriptions ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Vaccinations</span>
                    {doc.shareVaccinations ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Documents</span>
                    {doc.shareOriginalDocuments ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No doctors currently have access to your health records.</p>
        )}
      </div>

      {/* SECTION 2: FAMILY MEMBERS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Heart size={18} className="text-rose-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Family Members ({data?.familyMembers?.length || 0})
            </h2>
          </div>
          <button
            onClick={() => navigate('/app/family')}
            className="text-xs font-bold text-cyan-700 hover:underline"
          >
            Manage Family &rarr;
          </button>
        </div>

        {data?.familyMembers && data.familyMembers.length > 0 ? (
          <div className="space-y-4">
            {data.familyMembers.map((fam) => (
              <div key={fam.relationshipId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{fam.memberName}</h3>
                    <p className="text-[11px] text-slate-500">{fam.relationshipType}</p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Last accessed:{' '}
                    <strong>
                      {fam.lastAccessedAt
                        ? new Date(fam.lastAccessedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Never'}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Summary</span>
                    {fam.shareSummary ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Labs</span>
                    {fam.shareLabs ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Flags</span>
                    {fam.shareFlags ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Prescriptions</span>
                    {fam.sharePrescriptions ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>Vaccinations</span>
                    {fam.shareVaccinations ? <Check size={13} className="text-emerald-600 font-bold" /> : <X size={13} className="text-slate-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No family members connected.</p>
        )}
      </div>

      {/* SECTION 3: AUDIT TRAIL LOGS (Prompt Section 93, 94) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Clock size={18} className="text-slate-600" />
          <h2 className="font-display font-bold text-base text-slate-900">
            Recent Data Access Logs
          </h2>
        </div>

        {data?.accessLogs && data.accessLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {data.accessLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{log.actorName}</span>{' '}
                  <span className="text-slate-600">
                    {log.action === 'doctor_viewed_patient_records' && 'viewed your health records'}
                    {log.action === 'doctor_reviewed_summary' && 'submitted a clinical review on your summary'}
                    {log.action === 'patient_revoked_access' && 'access was revoked'}
                    {!['doctor_viewed_patient_records', 'doctor_reviewed_summary', 'patient_revoked_access'].includes(log.action) && log.action}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No access events recorded yet.</p>
        )}
      </div>
    </div>
  );
};
