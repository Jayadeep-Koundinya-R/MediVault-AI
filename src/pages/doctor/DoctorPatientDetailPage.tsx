import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctorService';
import { chatService } from '../../services/chatService';
import { 
  User as UserIcon, 
  Check, 
  X, 
  FileText, 
  Activity, 
  Pill, 
  Syringe, 
  MessageSquare, 
  Star, 
  ArrowLeft,
  AlertTriangle,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';

export const DoctorPatientDetailPage: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [patient, setPatient] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<any | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadPatientData = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const res = await doctorService.getDoctorPatientDetail(patientId);
      setPatient(res.patient);
      setPermissions(res.permissions);
      setData(res.data);
    } catch (err: any) {
      addToast(err?.message || 'Failed to load patient records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const handleMessagePatient = async () => {
    if (!patientId) return;
    try {
      const conv = await chatService.getOrCreateConversation({ patientId });
      navigate('/doctor/messages', { state: { conversationId: conv.id } });
    } catch (err: any) {
      addToast(err?.message || 'Failed to open conversation', 'error');
    }
  };

  const handleSubmitReview = async (summaryId: string) => {
    if (!reviewText.trim()) {
      addToast('Please enter your review notes before submitting.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await doctorService.submitDoctorReview(summaryId, patientId!, reviewText.trim());
      addToast('Review submitted. Doctor Reviewed ★ badge recorded.');
      setReviewText('');
      await loadPatientData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Patient not found or unauthorized.</p>
        <button
          onClick={() => navigate('/doctor/patients')}
          className="mt-3 text-cyan-600 font-bold hover:underline"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  const latestSummary = data?.summaries?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/doctor/patients')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Patients</span>
      </button>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-display font-extrabold text-2xl shadow-clinical-sm">
            {patient.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900">
              {patient.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span>DOB: {patient.dateOfBirth || 'Not provided'}</span>
              <span>•</span>
              <span>Blood Group: {patient.bloodGroup || 'Not provided'}</span>
              {patient.email && (
                <>
                  <span>•</span>
                  <span>{patient.email}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleMessagePatient}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-clinical-sm"
          >
            <MessageSquare size={16} />
            <span>Message Patient</span>
          </button>
        </div>
      </div>

      {/* Data Sharing Transparency Matrix (Prompt Section 97) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-clinical-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Patient-Shared Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            permissions?.shareSummary ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>AI Summary</span>
            {permissions?.shareSummary ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            permissions?.shareLabs ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Lab Results</span>
            {permissions?.shareLabs ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            permissions?.sharePrescriptions ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Prescriptions</span>
            {permissions?.sharePrescriptions ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            permissions?.shareVaccinations ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Vaccinations</span>
            {permissions?.shareVaccinations ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            permissions?.shareOriginalDocuments ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span>Original Docs</span>
            {permissions?.shareOriginalDocuments ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-slate-400" />}
          </div>
        </div>
      </div>

      {/* Section 1: AI Health Summary & Review */}
      {permissions?.shareSummary && latestSummary ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-semibold mb-1">
                <Sparkles size={12} className="text-cyan-600" />
                <span>AI Health Summary</span>
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Longitudinal Health Analysis
              </h2>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Generated: {new Date(latestSummary.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-[11px] font-mono text-slate-500">
                {latestSummary.modelProvider || 'Ollama'} · {latestSummary.modelName || 'qwen2.5:7b'}
              </p>
            </div>
          </div>

          {/* AI Summary Text */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {latestSummary.summaryText}
          </div>

          {/* Existing Doctor Reviews on this Summary */}
          {latestSummary.doctorReviews && latestSummary.doctorReviews.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                <Star size={16} className="text-blue-600 fill-blue-600" />
                <span>Doctor Reviewed ★</span>
              </div>
              {latestSummary.doctorReviews.map((rev: any) => (
                <div key={rev.id} className="text-xs text-blue-950 border-t border-blue-200/60 pt-2">
                  <div className="flex items-center justify-between mb-1 font-semibold text-blue-900">
                    <span>{rev.doctorName} ({rev.doctorSpecialization})</span>
                    <span className="text-[10px] text-blue-700">
                      {new Date(rev.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl">{rev.reviewText}</p>
                </div>
              ))}
            </div>
          )}

          {/* Doctor Review Submission Form (Prompt Section 25, 26) */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center space-x-1.5">
              <Star size={16} className="text-blue-600 fill-blue-600" />
              <span>Add Doctor Review</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Your professional notes will be securely recorded and will display the "Doctor Reviewed ★" blue-star badge on this patient’s summary.
            </p>
            <textarea
              rows={3}
              placeholder="Enter your clinical observations, guidance, or next test recommendations..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleSubmitReview(latestSummary.id)}
                disabled={isSubmittingReview || !reviewText.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-clinical-sm flex items-center space-x-2"
              >
                <Star size={14} className="fill-white" />
                <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review (Award ★ Badge)'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : permissions?.shareSummary ? (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
          <p className="text-xs font-semibold">No AI Health Summary generated by this patient yet.</p>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
          Patient has not shared AI Health Summary.
        </div>
      )}

      {/* Section 2: Recent Labs & Risk Flags */}
      {permissions?.shareLabs ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Activity size={18} className="text-cyan-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Laboratory Results ({data?.labResults?.length || 0})
            </h2>
          </div>

          {/* Safety Risk Flags */}
          {data?.riskFlags && data.riskFlags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Clinical Threshold Flags:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.riskFlags.map((flag: any) => (
                  <div key={flag.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
                      <span>{flag.ruleTriggered}</span>
                      <span className="uppercase text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-extrabold text-amber-900">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      {flag.thresholdDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labs Table */}
          {data?.labResults && data.labResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Test Name</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Reference Range</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Lab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.labResults.map((lab: any) => (
                    <tr key={lab.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{lab.testName}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-800">{lab.value} {lab.unit}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {lab.referenceRangeLow !== null && lab.referenceRangeHigh !== null
                          ? `${lab.referenceRangeLow} - ${lab.referenceRangeHigh} ${lab.unit}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(lab.testDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{lab.sourceLab || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No lab records found.</p>
          )}
        </div>
      ) : null}

      {/* Section 3: Prescriptions */}
      {permissions?.sharePrescriptions ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Pill size={18} className="text-indigo-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Prescriptions ({data?.prescriptions?.length || 0})
            </h2>
          </div>

          {data?.prescriptions && data.prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.prescriptions.map((rx: any) => (
                <div key={rx.id} className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{rx.drugName}</h4>
                  <p className="text-slate-600">Dosage: <strong className="text-indigo-950">{rx.dosage}</strong> · {rx.frequency}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Prescribed: {rx.prescribedDate} · {rx.sourceHospital}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No prescription records found.</p>
          )}
        </div>
      ) : null}

      {/* Section 4: Vaccinations */}
      {permissions?.shareVaccinations ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Syringe size={18} className="text-purple-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Vaccinations ({data?.vaccinations?.length || 0})
            </h2>
          </div>

          {data?.vaccinations && data.vaccinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.vaccinations.map((vax: any) => (
                <div key={vax.id} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{vax.vaccineName}</h4>
                  <p className="text-slate-600">Dose #{vax.doseNumber || 1} · {vax.facility}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Administered: {vax.dateAdministered}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No vaccination records found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
};
