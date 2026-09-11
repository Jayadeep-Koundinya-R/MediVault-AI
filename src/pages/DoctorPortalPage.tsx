import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { initialConsultations, initialDoctorEarnings } from '../data/mockDoctorData';
import { initialDocuments } from '../data/mockHealthData';
import { soundFX } from '../utils/audioEffects';
import { showToast } from '../components/Toast';

export const DoctorPortalPage: React.FC = () => {
  const [activeQueueTab, setActiveQueueTab] = useState<'queue' | 'earnings' | 'profile'>('queue');
  const [selectedConsultation, setSelectedConsultation] = useState(initialConsultations[0]);
  const [clinicalNote, setClinicalNote] = useState(selectedConsultation.doctorClinicalNote || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [earnings, setEarnings] = useState(initialDoctorEarnings);

  const handleConfirmAccuracy = () => {
    setIsConfirmed(true);
    soundFX.playChime();
    setEarnings((prev) => ({
      ...prev,
      totalEarned: prev.totalEarned + 400,
      pendingPayout: prev.pendingPayout + 400,
      completedReviews: prev.completedReviews + 1,
    }));
    showToast('success', 'AI Findings Verified', 'Clinical summary certified by physician. ₹400 credited to payout balance.');
  };

  const currentDocScan = initialDocuments.find((d) => d.documentId === 'doc_apollo_lab_0820') || initialDocuments[0];

  return (
    <div className="page-content">
      {/* Portal Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="page-title">Doctor Review & Clinical Triage Portal</h2>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#EEF2FF',
                color: '#4F46E5',
              }}
            >
              Physician Workspace
            </span>
          </div>
          <p className="page-subtitle">
            Validate AI summaries side-by-side with original hospital scans before patients receive advice
          </p>
        </div>

        <div className="page-header-actions">
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <DollarSign size={16} color="#059669" />
            <div>
              <div style={{ fontSize: '11px', color: '#047857' }}>PENDING PAYOUT</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#065F46' }}>
                ₹{earnings.pendingPayout.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveQueueTab('queue')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeQueueTab === 'queue' ? '#EEF2FF' : 'transparent',
            color: activeQueueTab === 'queue' ? '#4F46E5' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Stethoscope size={15} />
          <span>Patient Review Queue ({initialConsultations.length})</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('earnings')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeQueueTab === 'earnings' ? '#EEF2FF' : 'transparent',
            color: activeQueueTab === 'earnings' ? '#4F46E5' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <DollarSign size={15} />
          <span>Telemedicine Earnings & Payouts</span>
        </button>
      </div>

      {/* TAB 1: REVIEW QUEUE WORKSPACE */}
      {activeQueueTab === 'queue' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Patient Queue List */}
          <div className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              Pending Physician Reviews (Sorted by Urgency)
            </div>

            {initialConsultations.map((c) => {
              const isSelected = c.consultationId === selectedConsultation.consultationId;
              return (
                <div
                  key={c.consultationId}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedConsultation(c);
                    setClinicalNote(c.doctorClinicalNote || '');
                    setIsConfirmed(false);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#EEF2FF' : '#FAFBFD',
                    border: isSelected ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B' }}>{c.patientName}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        backgroundColor: c.urgency === 'high' ? '#FEE2E2' : '#FEF3C7',
                        color: c.urgency === 'high' ? '#DC2626' : '#D97706',
                      }}
                    >
                      {c.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', lineHeight: 1.3 }}>
                    {c.flaggedSummary.substring(0, 75)}...
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                    <span>{new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    <span style={{ color: '#4F46E5', fontWeight: 600 }}>Review Now →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side Review Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Patient Case Overview */}
            <div className="ui-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    Case Review: {selectedConsultation.patientName}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    User ID: {selectedConsultation.userId} · Intake Completed
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleConfirmAccuracy}
                    disabled={isConfirmed}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isConfirmed ? '#10B981' : '#4F46E5',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: isConfirmed ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{isConfirmed ? 'AI Findings Certified ✓' : 'Confirm AI Accuracy'}</span>
                  </button>
                </div>
              </div>

              {/* 2 Columns: Left AI Extracted Summary & Right Scanned Document */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                {/* Left Panel: AI Extraction & Triage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#FAFBFD', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: '6px' }}>
                      ⚠ AI Detected Clinical Flag
                    </div>
                    <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: 1.5 }}>
                      {selectedConsultation.flaggedSummary}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Pre-Chat Patient Triage Responses
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      {selectedConsultation.triageResponses.map((t, i) => (
                        <div key={i}>
                          <span style={{ fontWeight: 700, color: '#475569' }}>{t.question}: </span>
                          <span style={{ color: '#1E293B' }}>{t.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Add Doctor Clinical Assessment & Prescription Note
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="Enter clinical assessment, dosage adjustment, or in-clinic review note..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        marginTop: '4px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* Right Panel: Original Scanned Document */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Original Document Scan
                    </span>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Apollo Hospital</span>
                  </div>

                  <div
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      height: '270px',
                      backgroundColor: '#F1F5F9',
                    }}
                  >
                    <img
                      src={currentDocScan.imageUrl}
                      alt="Hospital Scan"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                    Raw OCR Buffer verified with 97.4% confidence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR EARNINGS & PAYOUTS */}
      {activeQueueTab === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="ui-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>TOTAL CONSULTATION EARNINGS</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1E293B', marginTop: '6px' }}>
                ₹{earnings.totalEarned.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#10B981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> +18.4% this month
              </div>
            </div>

            <div className="ui-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>PENDING WEEKLY PAYOUT</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
                ₹{earnings.pendingPayout.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                Next direct bank deposit: Friday
              </div>
            </div>

            <div className="ui-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>COMPLETED CASE REVIEWS</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#4F46E5', marginTop: '6px' }}>
                {earnings.completedReviews}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                Avg review time: 3.5 mins
              </div>
            </div>
          </div>

          {/* Payout Schedule Card */}
          <div className="ui-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: '0 0 12px 0' }}>
              MediVault Doctor Payout Model (Telemedicine Gig Economics)
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Doctors receive <strong>₹400 per AI review and verification</strong> completed, plus <strong>75% of consultation chat fees</strong>. Because MediVault’s pre-chat AI triage organizes patient symptoms in advance, doctors save an average of 7 minutes per consultation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
