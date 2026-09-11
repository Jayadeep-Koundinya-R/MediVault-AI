import React from 'react';
import { Syringe, Calendar, Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { initialVaccinations } from '../data/mockHealthData';

export const VaccinationsPage: React.FC = () => {
  const vaccinations = [...initialVaccinations].sort((a, b) =>
    b.dateAdministered.localeCompare(a.dateAdministered)
  );

  const totalDoses = vaccinations.reduce((sum, v) => sum + (v.doseNumber || 1), 0);
  const uniqueVaccines = new Set(vaccinations.map(v => v.vaccineName)).size;
  const upcomingDue = vaccinations.filter(v => v.nextDueDate && v.nextDueDate > new Date().toISOString().split('T')[0]);

  // Coverage visualization
  const commonVaccines = [
    { name: 'COVID-19', required: 2, icon: '🦠' },
    { name: 'Hepatitis B', required: 3, icon: '🔬' },
    { name: 'Tetanus', required: 1, icon: '💉' },
    { name: 'Influenza', required: 1, icon: '🤧' },
  ];

  const getVaccineColor = (index: number) => {
    const colors = ['#10B981', '#06B6D4', '#7B73F6', '#F5A623', '#EC4899'];
    return colors[index % colors.length];
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Vaccination Records</h2>
          <p className="page-subtitle">Immunization history across hospitals with upcoming schedules</p>
        </div>
      </div>

      {/* Vaccination Stats */}
      <div className="vac-stats-row">
        <div className="vac-stat-card">
          <div className="vac-stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
            <Syringe size={20} />
          </div>
          <div>
            <div className="vac-stat-value">{totalDoses}</div>
            <div className="vac-stat-label">Total Doses</div>
          </div>
        </div>
        <div className="vac-stat-card">
          <div className="vac-stat-icon" style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="vac-stat-value">{uniqueVaccines}</div>
            <div className="vac-stat-label">Unique Vaccines</div>
          </div>
        </div>
        <div className="vac-stat-card">
          <div className="vac-stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="vac-stat-value">{upcomingDue.length}</div>
            <div className="vac-stat-label">Upcoming Due</div>
          </div>
        </div>
      </div>

      {/* Immunization Coverage Cards */}
      <div className="vac-coverage-section">
        <h3 className="section-title">Immunization Coverage</h3>
        <div className="vac-coverage-grid">
          {commonVaccines.map((cv, idx) => {
            const received = vaccinations.filter(v =>
              v.vaccineName.toLowerCase().includes(cv.name.toLowerCase())
            );
            const coverage = Math.min(100, Math.round((received.length / cv.required) * 100));
            const radius = 30;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (circumference * (coverage / 100));

            return (
              <div key={cv.name} className="ui-card vac-coverage-card">
                <div className="vac-coverage-top">
                  <span className="vac-emoji">{cv.icon}</span>
                  <span className="vac-coverage-name">{cv.name}</span>
                </div>

                <div className="vac-coverage-ring">
                  <svg width="76" height="76" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r={radius} fill="transparent"
                      stroke="#F1F5F9" strokeWidth="6" />
                    <circle cx="38" cy="38" r={radius} fill="transparent"
                      stroke={getVaccineColor(idx)} strokeWidth="6"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '38px 38px', transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="vac-coverage-percent">{coverage}%</div>
                </div>

                <div className="vac-coverage-info">
                  {received.length}/{cv.required} dose{cv.required > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vaccination Cards List */}
      <div className="vac-list-section">
        <h3 className="section-title">All Vaccination Records</h3>
        <div className="vac-card-list">
          {vaccinations.map((vac, idx) => (
            <div key={vac.vaccinationId} className="ui-card vac-record-card">
              <div className="vac-record-left">
                <div className="vac-record-icon" style={{ backgroundColor: `${getVaccineColor(idx)}15`, color: getVaccineColor(idx) }}>
                  <Syringe size={18} />
                </div>
                <div>
                  <div className="vac-record-name">{vac.vaccineName}</div>
                  <div className="vac-record-sub">
                    Dose #{vac.doseNumber || 1} · {vac.facility || 'Unknown Facility'}
                  </div>
                </div>
              </div>

              <div className="vac-record-meta">
                <div className="vac-record-date">
                  <Calendar size={13} />
                  <span>{new Date(vac.dateAdministered).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="vac-record-facility">
                  <Building2 size={13} />
                  <span>{vac.facility || 'Hospital'}</span>
                </div>
              </div>

              <div className="vac-record-right">
                {vac.nextDueDate ? (
                  <div className="vac-due-badge">
                    <AlertCircle size={12} />
                    <span>Next: {new Date(vac.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </div>
                ) : (
                  <div className="vac-complete-badge">
                    <CheckCircle2 size={12} />
                    <span>Complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
