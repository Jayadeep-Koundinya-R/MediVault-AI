import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctorService';
import { chatService } from '../../services/chatService';
import { DoctorProfile, DoctorPatientRelationship } from '../../types';
import { 
  Users, 
  Clock, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  Check, 
  X, 
  Star, 
  Activity, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { user, addToast } = useApp();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [requests, setRequests] = useState<DoctorPatientRelationship[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [prof, pats, reqs, reps, convs] = await Promise.all([
        doctorService.getDoctorProfile().catch(() => null),
        doctorService.getDoctorPatients().catch(() => []),
        doctorService.getDoctorRequests().catch(() => []),
        doctorService.getDoctorReports('needs_review').catch(() => []),
        chatService.getConversations().catch(() => []),
      ]);

      setProfile(prof);
      setPatients(pats);
      setRequests(reqs.filter((r) => r.status === 'pending'));
      setReports(reps);

      const unread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadMessages(unread);
    } catch (e) {
      console.warn('Dashboard load note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await doctorService.updateRequestStatus({ requestId, status });
      addToast(`Patient connection ${status}`);
      await loadDashboardData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update request', 'error');
    }
  };

  const doctorName = profile?.fullName || user?.name || 'Physician';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-clinical-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <ShieldCheck size={13} />
            <span>MediVault Clinical Workspace</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Good morning, {doctorName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {profile?.specialization || 'General Medicine'} · {profile?.clinicName || 'CityCare Clinic'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/doctor/patients')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-clinical-sm"
          >
            View All Patients
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Trusted Patients</span>
            <Users size={18} className="text-cyan-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{patients.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Active connections</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Requests</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{requests.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting your response</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Reports to Review</span>
            <FileText size={18} className="text-brand-900" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-900">{reports.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Shared AI summaries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clinical-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Unread Messages</span>
            <MessageSquare size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{unreadMessages}</p>
          <span className="text-[10px] text-slate-400 font-medium">Patient conversations</span>
        </div>
      </div>

      {/* Pending Connection Requests (Prompt Section 16 & 17) */}
      {requests.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-clinical-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-amber-600" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Pending Patient Connection Requests ({requests.length})
              </h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {req.patientProfile?.fullName || 'Patient'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Requested on {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {req.patientProfile?.email ? ` · ${req.patientProfile.email}` : ''}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRequestAction(req.id, 'accepted')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-clinical-sm"
                  >
                    <Check size={14} />
                    <span>Accept Connection</span>
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.id, 'declined')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                  >
                    <X size={14} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Reports Needing Review & Connected Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports to Review */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-clinical-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText size={18} className="text-brand-900" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Shared AI Reports to Review
                </h3>
              </div>
              <button
                onClick={() => navigate('/doctor/reports')}
                className="text-xs font-bold text-cyan-700 hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShieldCheck size={28} className="mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs font-medium">All patient shared reports have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 3).map((rep) => (
                  <div
                    key={rep.summaryId}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/doctor/patients/${rep.patientId}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{rep.patientName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rep.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {rep.summaryText}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold">
                        <AlertTriangle size={12} />
                        <span>{rep.flagsCount || 0} safety flags</span>
                      </span>
                      <span className="font-bold text-cyan-700 hover:underline">
                        Review Report →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Connected Patients Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-clinical-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-cyan-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Trusted Patients ({patients.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('/doctor/patients')}
                className="text-xs font-bold text-cyan-700 hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {patients.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Users size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No connected patients yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Patients can search for your profile and send a connection request.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.slice(0, 4).map((p) => (
                  <div
                    key={p.patientId}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{p.fullName}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{p.bloodGroup || 'Blood type unrecorded'}</span>
                        <span>•</span>
                        <span>{p.flagsCount || 0} flags</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/doctor/patients/${p.patientId}`)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
                    >
                      View Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
