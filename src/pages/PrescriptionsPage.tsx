import React, { useState, useMemo } from 'react';
import {
  Pill,
  Calendar,
  Clock,
  Building2,
  User,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Check,
  Bell,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Prescription, HealthDocument, TimelineItem } from '../types';
import { soundFX } from '../utils/audioEffects';
import { showToast } from '../components/Toast';

interface PrescriptionsPageProps {
  prescriptions: Prescription[];
  documents: HealthDocument[];
  onSelectRecord: (item: TimelineItem) => void;
  onOpenUpload: () => void;
}

export const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({
  prescriptions,
  documents,
  onSelectRecord,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [takenDoses, setTakenDoses] = useState<Record<string, boolean>>({
    dose_metformin_am: true,
    dose_glimepiride_am: true,
  });

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => b.prescribedDate.localeCompare(a.prescribedDate));
  }, [prescriptions]);

  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) return sortedPrescriptions;
    const q = searchQuery.toLowerCase();
    return sortedPrescriptions.filter(
      (p) =>
        p.drugName.toLowerCase().includes(q) ||
        p.dosage.toLowerCase().includes(q) ||
        (p.prescribingDoctor && p.prescribingDoctor.toLowerCase().includes(q)) ||
        (p.sourceHospital && p.sourceHospital.toLowerCase().includes(q))
    );
  }, [sortedPrescriptions, searchQuery]);

  // Determine active vs past (within last 90 days is considered active)
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const activeRx = filteredPrescriptions.filter((p) => p.prescribedDate >= cutoff);
  const pastRx = filteredPrescriptions.filter((p) => p.prescribedDate < cutoff);

  const getRxColor = (index: number) => {
    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F5A623', '#EC4899', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const toggleDose = (doseId: string, label: string) => {
    const nextState = !takenDoses[doseId];
    setTakenDoses((prev) => ({ ...prev, [doseId]: nextState }));
    if (nextState) {
      soundFX.playChime();
      showToast('success', 'Dose Logged', `${label} marked as taken`);
    } else {
      soundFX.playClick();
      showToast('info', 'Dose Reset', `${label} marked as pending`);
    }
  };

  const handleCardClick = (rx: Prescription) => {
    soundFX.playClick();
    const doc = documents.find((d) => d.documentId === rx.documentId) || {
      documentId: rx.documentId,
      userId: rx.userId,
      type: 'prescription',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      uploadedAt: rx.prescribedDate,
      ocrStatus: 'success',
      confidenceScore: 92.1,
      rawOcrText: `PRESCRIPTION: ${rx.drugName} ${rx.dosage}\nFrequency: ${rx.frequency}\nDoctor: ${rx.prescribingDoctor}\nHospital: ${rx.sourceHospital}`,
    };

    const item: TimelineItem = {
      id: `item_${rx.prescriptionId}`,
      documentId: rx.documentId,
      type: 'prescription',
      title: rx.drugName,
      subtitle: `${rx.dosage} · ${rx.frequency}`,
      date: rx.prescribedDate,
      sourceFacility: rx.sourceHospital || 'Hospital Pharmacy',
      valueDisplay: `${rx.dosage} (${rx.frequency})`,
      referenceRange: 'Prescribed by certified physician',
      isFlagged: false,
      manuallyCorrected: rx.manuallyCorrected,
      ocrConfidence: doc.confidenceScore || 92,
      document: doc,
      rawPayload: rx,
    };

    onSelectRecord(item);
  };

  // Daily Schedule Slots (PRD Stretch Feature #2)
  const scheduleSlots = [
    {
      id: 'morning',
      title: 'Morning (8:00 AM)',
      meds: [
        { id: 'dose_metformin_am', drug: 'Metformin 500mg', instructions: 'With breakfast' },
        { id: 'dose_glimepiride_am', drug: 'Glimepiride 1mg', instructions: '30 min before food' },
      ],
    },
    {
      id: 'afternoon',
      title: 'Afternoon (1:30 PM)',
      meds: [
        { id: 'dose_pantoprazole_pm', drug: 'Pantoprazole 40mg', instructions: 'Before lunch' },
      ],
    },
    {
      id: 'evening',
      title: 'Evening (8:30 PM)',
      meds: [
        { id: 'dose_metformin_pm', drug: 'Metformin 500mg', instructions: 'With dinner' },
        { id: 'dose_atorvastatin_pm', drug: 'Atorvastatin 20mg', instructions: 'At bedtime' },
      ],
    },
  ];

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Prescriptions & Active Regimens</h2>
          <p className="page-subtitle">
            Consolidated medications digitized across healthcare providers with daily schedule tracking
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              soundFX.playChime();
              onOpenUpload();
            }}
          >
            <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>Upload Prescription</span>
          </button>
        </div>
      </div>

      {/* Daily Medication Schedule Tracker (PRD Stretch Feature #2) */}
      <div className="ui-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Today's Medication Schedule & Reminders
              </h3>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                Auto-generated from extracted doctor prescriptions
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={14} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
              Notifications Active
            </span>
          </div>
        </div>

        {/* Schedule Slots */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {scheduleSlots.map((slot) => (
            <div
              key={slot.id}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Clock size={13} color="#6366F1" />
                <span>{slot.title}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {slot.meds.map((m) => {
                  const isTaken = Boolean(takenDoses[m.id]);
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isTaken ? '#F0FDF4' : '#FFFFFF',
                        border: isTaken ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isTaken ? '#15803D' : '#1E293B',
                            textDecoration: isTaken ? 'line-through' : 'none',
                          }}
                        >
                          {m.drug}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{m.instructions}</div>
                      </div>

                      <button
                        onClick={() => toggleDose(m.id, m.drug)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: isTaken ? 'none' : '1.5px solid #CBD5E1',
                          backgroundColor: isTaken ? '#16A34A' : '#FFFFFF',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title={isTaken ? 'Dose taken' : 'Mark as taken'}
                      >
                        {isTaken && <Check size={16} strokeWidth={3} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B' }}>
          All Prescriptions ({filteredPrescriptions.length})
        </div>

        <div className="search-input-wrapper" style={{ width: '260px' }}>
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            style={{ height: '36px', fontSize: '12px' }}
            placeholder="Search medications, doctor, hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Active Medications Grid */}
      <div className="rx-section">
        <div className="rx-section-header">
          <div className="rx-section-badge active">
            <Pill size={14} />
            <span>Active Medications ({activeRx.length})</span>
          </div>
        </div>

        {activeRx.length === 0 ? (
          <div className="ui-card" style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F4F2FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={24} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              No Active Prescriptions Found
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
              Upload handwritten or printed doctor prescriptions to automatically extract drug names, dosages, and daily medication schedules.
            </p>
            <button className="btn-primary" onClick={onOpenUpload} style={{ marginTop: '8px', padding: '8px 18px', fontSize: '13px' }}>
              Upload Prescription
            </button>
          </div>
        ) : (
          <div className="rx-card-grid">
            {activeRx.map((rx, idx) => (
            <div
              key={rx.prescriptionId}
              className="ui-card rx-card"
              onClick={() => handleCardClick(rx)}
              style={{ cursor: 'pointer' }}
            >
              <div className="rx-card-top">
                <div
                  className="rx-drug-icon"
                  style={{
                    backgroundColor: `${getRxColor(idx)}18`,
                    color: getRxColor(idx),
                  }}
                >
                  <Pill size={20} />
                </div>
                <div className="rx-status-active">
                  <CheckCircle2 size={12} />
                  <span>Active</span>
                </div>
              </div>

              <div className="rx-drug-name">{rx.drugName}</div>
              <div className="rx-drug-dosage">
                {rx.dosage} — {rx.frequency}
              </div>

              <div className="rx-details-grid">
                <div className="rx-detail-item">
                  <User size={13} />
                  <span>{rx.prescribingDoctor || 'Doctor not specified'}</span>
                </div>
                <div className="rx-detail-item">
                  <Building2 size={13} />
                  <span>{rx.sourceHospital || 'Hospital not specified'}</span>
                </div>
                <div className="rx-detail-item">
                  <Calendar size={13} />
                  <span>
                    Prescribed{' '}
                    {new Date(rx.prescribedDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                {rx.manuallyCorrected ? (
                  <div className="rx-corrected-badge">
                    <AlertCircle size={12} />
                    <span>Manually Verified</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> OCR High Confidence
                  </span>
                )}

                <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} /> View Scan
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Past / Completed Medications */}
      {pastRx.length > 0 && (
        <div className="rx-section" style={{ marginTop: '28px' }}>
          <div className="rx-section-header">
            <div className="rx-section-badge past">
              <Clock size={14} />
              <span>Past & Completed Courses ({pastRx.length})</span>
            </div>
          </div>

          <div className="rx-card-grid">
            {pastRx.map((rx) => (
              <div
                key={rx.prescriptionId}
                className="ui-card rx-card rx-card-past"
                onClick={() => handleCardClick(rx)}
                style={{ cursor: 'pointer' }}
              >
                <div className="rx-card-top">
                  <div className="rx-drug-icon" style={{ backgroundColor: '#F1F5F9', color: '#94A3B8' }}>
                    <Pill size={20} />
                  </div>
                  <div className="rx-status-past">
                    <Clock size={12} />
                    <span>Completed</span>
                  </div>
                </div>

                <div className="rx-drug-name">{rx.drugName}</div>
                <div className="rx-drug-dosage">
                  {rx.dosage} — {rx.frequency}
                </div>

                <div className="rx-details-grid">
                  <div className="rx-detail-item">
                    <User size={13} />
                    <span>{rx.prescribingDoctor || 'Doctor not specified'}</span>
                  </div>
                  <div className="rx-detail-item">
                    <Building2 size={13} />
                    <span>{rx.sourceHospital || 'Hospital not specified'}</span>
                  </div>
                  <div className="rx-detail-item">
                    <Calendar size={13} />
                    <span>
                      Prescribed{' '}
                      {new Date(rx.prescribedDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
