import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { doctorService } from '../services/doctorService';
import { DoctorProfile } from '../types';
import { Search, Stethoscope, CheckCircle2, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

export const FindDoctorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const searchDoctors = async (searchStr: string) => {
    setIsLoading(true);
    try {
      const res = await doctorService.searchDoctors(searchStr);
      setDoctors(res);
    } catch (e) {
      console.warn('Search doctors note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchDoctors('');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDoctors(query);
  };

  const handleConnect = async (doctorId: string, docName: string) => {
    setConnectingId(doctorId);
    try {
      await doctorService.requestConnection(doctorId);
      addToast(`Connection request sent to ${docName}`);
      navigate('/app/doctors');
    } catch (err: any) {
      addToast(err?.message || 'Failed to send connection request', 'error');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/doctors')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Trusted Doctors</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900">
          Find a Trusted Doctor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search registered, verified healthcare professionals to share your health records and receive clinical reviews.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialization (Cardiology, etc.), clinic, or registration number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-clinical-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-clinical-sm transition-colors"
        >
          Search
        </button>
      </form>

      {/* Doctor Cards */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Stethoscope size={36} className="mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-sm text-slate-800">No doctors match your query</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for "General Medicine", "CityCare", or leave the field blank to see all verified doctors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-clinical-sm flex flex-col justify-between hover:border-cyan-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold text-lg">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{doc.fullName}</h3>
                      <p className="text-xs font-semibold text-cyan-700">{doc.specialization}</p>
                    </div>
                  </div>

                  {doc.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>Verified Doctor ✓</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-medium text-slate-800">{doc.clinicName}</p>
                  {doc.clinicAddress && <p className="text-slate-400 text-[11px]">{doc.clinicAddress}</p>}
                  <p className="text-slate-500">{doc.yearsOfExperience} years of experience</p>
                </div>

                {doc.bio && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                    {doc.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Reg: {doc.medicalRegistrationNumber}
                </span>

                <button
                  onClick={() => handleConnect(doc.userId, doc.fullName)}
                  disabled={connectingId === doc.userId}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-clinical-sm"
                >
                  <UserCheck size={14} />
                  <span>{connectingId === doc.userId ? 'Connecting...' : 'Request to Connect'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
