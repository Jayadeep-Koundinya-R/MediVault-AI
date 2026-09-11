import React from 'react';
import { Pill, Calendar, Clock, Building2, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { initialPrescriptions } from '../data/mockHealthData';

export const PrescriptionsPage: React.FC = () => {
  const prescriptions = [...initialPrescriptions].sort((a, b) =>
    b.prescribedDate.localeCompare(a.prescribedDate)
  );

  // Determine active vs past (assume any within last 90 days is active)
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const activeRx = prescriptions.filter(p => p.prescribedDate >= cutoff);
  const pastRx = prescriptions.filter(p => p.prescribedDate < cutoff);

  const getRxColor = (index: number) => {
    const colors = ['#7B73F6', '#F5A623', '#06B6D4', '#10B981', '#EF4444', '#EC4899'];
    return colors[index % colors.length];
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Prescriptions</h2>
          <p className="page-subtitle">Active and past medications from all healthcare providers</p>
        </div>
      </div>

      {/* Active Medications */}
      <div className="rx-section">
        <div className="rx-section-header">
          <div className="rx-section-badge active">
            <Pill size={14} />
            <span>Active Medications ({activeRx.length})</span>
          </div>
        </div>

        <div className="rx-card-grid">
          {activeRx.map((rx, idx) => (
            <div key={rx.prescriptionId} className="ui-card rx-card">
              <div className="rx-card-top">
                <div className="rx-drug-icon" style={{ backgroundColor: `${getRxColor(idx)}15`, color: getRxColor(idx) }}>
                  <Pill size={20} />
                </div>
                <div className="rx-status-active">
                  <CheckCircle2 size={12} />
                  <span>Active</span>
                </div>
              </div>

              <div className="rx-drug-name">{rx.drugName}</div>
              <div className="rx-drug-dosage">{rx.dosage} — {rx.frequency}</div>

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
                  <span>Since {new Date(rx.prescribedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {rx.manuallyCorrected && (
                <div className="rx-corrected-badge">
                  <AlertCircle size={12} />
                  <span>Manually Corrected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Past Medications */}
      {pastRx.length > 0 && (
        <div className="rx-section">
          <div className="rx-section-header">
            <div className="rx-section-badge past">
              <Clock size={14} />
              <span>Past Medications ({pastRx.length})</span>
            </div>
          </div>

          <div className="rx-card-grid">
            {pastRx.map((rx, _idx) => (
              <div key={rx.prescriptionId} className="ui-card rx-card rx-card-past">
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
                <div className="rx-drug-dosage">{rx.dosage} — {rx.frequency}</div>

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
                    <span>{new Date(rx.prescribedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Timeline */}
      <div className="ui-card rx-timeline-card">
        <div className="rx-timeline-header">
          <h3>Medication Timeline</h3>
          <p>Chronological view of all prescriptions</p>
        </div>
        <div className="rx-timeline">
          {prescriptions.map((rx, idx) => (
            <div key={rx.prescriptionId} className="rx-timeline-item">
              <div className="rx-timeline-dot" style={{ backgroundColor: getRxColor(idx) }} />
              <div className="rx-timeline-line" />
              <div className="rx-timeline-content">
                <div className="rx-timeline-date">
                  {new Date(rx.prescribedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="rx-timeline-title">{rx.drugName} — {rx.dosage}</div>
                <div className="rx-timeline-sub">{rx.frequency} · {rx.sourceHospital || 'Hospital'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
