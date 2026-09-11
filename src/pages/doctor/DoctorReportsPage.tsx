import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { FileText, Star, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const DoctorReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'needs_review' | 'reviewed'>('all');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const reps = await doctorService.getDoctorReports(tab);
      setReports(reps);
    } catch (e) {
      console.warn('Load reports note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [tab]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            Reports &amp; Clinical Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review shared AI health summaries, verify longitudinal trends, and award Doctor Reviewed ★ badges.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              tab === 'all'
                ? 'bg-white text-slate-900 shadow-clinical-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setTab('needs_review')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              tab === 'needs_review'
                ? 'bg-white text-slate-900 shadow-clinical-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setTab('reviewed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              tab === 'reviewed'
                ? 'bg-white text-slate-900 shadow-clinical-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviewed ★
          </button>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-sm text-slate-800">No reports found in this view</h3>
          <p className="text-xs text-slate-400 mt-1">
            When connected patients share an AI Health Summary, it will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.summaryId}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-clinical-sm hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-base text-slate-900">{rep.patientName}</h3>
                  <span className="text-xs text-slate-400">
                    Generated {new Date(rep.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {rep.isReviewed ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                      <Star size={12} className="fill-blue-600 text-blue-600" />
                      <span>Reviewed ★</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <Clock size={12} className="text-amber-600" />
                      <span>Needs Review</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rep.summaryText}
                </p>

                <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center space-x-1 text-amber-700 font-semibold">
                    <AlertTriangle size={13} />
                    <span>{rep.flagsCount || 0} safety flags</span>
                  </span>
                  {rep.doctorReview && (
                    <span className="text-blue-900 font-medium">
                      Reviewed on {new Date(rep.doctorReview.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate(`/doctor/patients/${rep.patientId}`)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-clinical-sm"
                >
                  <span>{rep.isReviewed ? 'View Report' : 'Review Report'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
