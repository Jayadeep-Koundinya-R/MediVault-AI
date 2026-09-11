import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctorService';
import { DoctorPatientRelationship } from '../../types';
import { Users, Clock, Search, ArrowRight, Check, X, Shield, AlertTriangle } from 'lucide-react';

export const DoctorPatientsPage: React.FC = () => {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'connected' | 'pending'>('connected');
  const [patients, setPatients] = useState<any[]>([]);
  const [requests, setRequests] = useState<DoctorPatientRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pats, reqs] = await Promise.all([
        doctorService.getDoctorPatients().catch(() => []),
        doctorService.getDoctorRequests().catch(() => []),
      ]);
      setPatients(pats);
      setRequests(reqs.filter((r) => r.status === 'pending'));
    } catch (e) {
      console.warn('Load patients note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await doctorService.updateRequestStatus({ requestId, status });
      addToast(`Patient connection ${status}`);
      await loadData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update request', 'error');
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            My Patients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your connected patient relationships and review permitted clinical records.
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
          <button
            onClick={() => setTab('connected')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              tab === 'connected'
                ? 'bg-white text-slate-900 shadow-clinical-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Connected ({patients.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              tab === 'pending'
                ? 'bg-white text-slate-900 shadow-clinical-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Requests</span>
            {requests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'connected' ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Patient Cards Grid */}
          {filteredPatients.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 p-6">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <h3 className="font-bold text-sm text-slate-800">No connected patients found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Patients can find your verified profile and request connection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => (
                <div
                  key={p.patientId}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-clinical-sm hover:border-cyan-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{p.fullName}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.dateOfBirth ? `DOB: ${p.dateOfBirth}` : 'DOB unrecorded'}
                        </p>
                      </div>
                      <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full font-bold">
                        Connected
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Latest Report:</span>
                        <span className="font-medium text-slate-800">
                          {p.latestSummary
                            ? new Date(p.latestSummary.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : 'None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Safety Risk Flags:</span>
                        <span className="font-bold text-amber-700 flex items-center space-x-1">
                          <AlertTriangle size={12} />
                          <span>{p.flagsCount || 0}</span>
                        </span>
                      </div>
                    </div>

                    {/* Permitted Data Tags */}
                    <div className="mb-4">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Shared Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.shareSummary && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            AI Summary
                          </span>
                        )}
                        {p.shareLabs && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                            Labs
                          </span>
                        )}
                        {p.sharePrescriptions && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                            Prescriptions
                          </span>
                        )}
                        {p.shareVaccinations && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                            Vaccinations
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/doctor/patients/${p.patientId}`)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-clinical-sm"
                  >
                    <span>View Patient</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Pending Requests Tab */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-clinical-sm">
          {requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No pending requests at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {req.patientProfile?.fullName || 'Patient'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested on {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {req.patientProfile?.email ? ` · ${req.patientProfile.email}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRequestAction(req.id, 'accepted')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-clinical-sm"
                    >
                      <Check size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRequestAction(req.id, 'declined')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
