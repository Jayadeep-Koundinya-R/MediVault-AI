import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { doctorService } from '../services/doctorService';
import { chatService } from '../services/chatService';
import { DoctorPatientRelationship } from '../types';
import { 
  Stethoscope, 
  Search, 
  ShieldCheck, 
  Settings, 
  MessageSquare, 
  UserMinus, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const TrustedDoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [relationships, setRelationships] = useState<DoctorPatientRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const reqs = await doctorService.getDoctorRequests();
      setRelationships(reqs.filter((r) => r.status !== 'revoked' && r.status !== 'declined'));
    } catch (e) {
      console.warn('Load doctors note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleMessage = async (doctorId: string) => {
    try {
      const conv = await chatService.getOrCreateConversation({ doctorId });
      navigate('/app/messages', { state: { conversationId: conv.id } });
    } catch (err: any) {
      addToast(err?.message || 'Failed to open conversation', 'error');
    }
  };

  const handleRevoke = async (requestId: string) => {
    if (!window.confirm('Remove this doctor? They will no longer be able to view your shared health records.')) {
      return;
    }

    try {
      await doctorService.updateRequestStatus({ requestId, status: 'revoked' });
      addToast('Doctor access revoked');
      await loadDoctors();
    } catch (err: any) {
      addToast(err?.message || 'Failed to revoke access', 'error');
    }
  };

  const connectedDoctors = relationships.filter((r) => r.status === 'accepted');
  const pendingDoctors = relationships.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            My Trusted Doctors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with verified doctors, share AI health summaries, and receive professional clinical reviews.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/doctors/find')}
          className="px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-clinical-sm"
        >
          <Search size={15} />
          <span>Find a Doctor</span>
        </button>
      </div>

      {/* Pending Connection Requests Sent by Patient */}
      {pendingDoctors.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
            <Clock size={15} className="text-amber-600" />
            <span>Pending Doctor Acceptance ({pendingDoctors.length})</span>
          </div>
          <div className="divide-y divide-amber-100">
            {pendingDoctors.map((rel) => (
              <div key={rel.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{rel.doctorProfile?.fullName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {rel.doctorProfile?.specialization} · {rel.doctorProfile?.clinicName}
                  </p>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold">
                  Awaiting doctor response
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Doctors List */}
      {connectedDoctors.length === 0 && pendingDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-clinical">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto mb-3">
            <Stethoscope size={30} />
          </div>
          <h2 className="font-display font-bold text-base text-slate-900 mb-1">
            You haven’t connected with a trusted doctor yet
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Search our directory of verified physicians to securely share your health reports, receive Doctor Reviewed ★ badges, and chat securely.
          </p>
          <button
            onClick={() => navigate('/app/doctors/find')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-clinical-sm transition-colors"
          >
            <Search size={15} />
            <span>Find a Trusted Doctor</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connectedDoctors.map((rel) => {
            const doc = rel.doctorProfile;
            const perms = rel.permissions;
            return (
              <div
                key={rel.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-clinical-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-900 flex items-center justify-center font-bold text-xl shrink-0">
                    <Stethoscope size={24} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">{doc?.fullName}</h3>
                      {doc?.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Verified Doctor ✓</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {doc?.specialization} · {doc?.clinicName}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="font-semibold text-slate-400">Sharing:</span>
                      {perms?.shareSummary && (
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                          AI Summary
                        </span>
                      )}
                      {perms?.shareLabs && (
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-medium border border-blue-200">
                          Labs
                        </span>
                      )}
                      {perms?.sharePrescriptions && (
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium border border-indigo-200">
                          Prescriptions
                        </span>
                      )}
                      {perms?.shareVaccinations && (
                        <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-medium border border-purple-200">
                          Vaccinations
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleMessage(rel.doctorId)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-clinical-sm"
                  >
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/doctors/${rel.id}/sharing`, { state: { relationship: rel } })}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    title="Configure what this doctor can see"
                  >
                    <Settings size={14} />
                    <span>Sharing</span>
                  </button>

                  <button
                    onClick={() => handleRevoke(rel.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove access"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
