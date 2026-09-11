import React, { useState, useMemo } from 'react';
import {
  Syringe,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Vaccination, HealthDocument, TimelineItem } from '../types';
import { soundFX } from '../utils/audioEffects';

interface VaccinationsPageProps {
  vaccinations: Vaccination[];
  documents: HealthDocument[];
  onSelectRecord: (item: TimelineItem) => void;
  onOpenUpload: () => void;
}

export const VaccinationsPage: React.FC<VaccinationsPageProps> = ({
  vaccinations,
  documents,
  onSelectRecord,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'due'>('all');

  const sortedVaccinations = useMemo(() => {
    return [...vaccinations].sort((a, b) => b.dateAdministered.localeCompare(a.dateAdministered));
  }, [vaccinations]);

  const filteredVaccinations = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sortedVaccinations.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.vaccineName.toLowerCase().includes(q) ||
        (v.facility && v.facility.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const isDue = v.nextDueDate && v.nextDueDate > today;
      if (statusFilter === 'due') return isDue;
      if (statusFilter === 'completed') return !isDue;
      return true;
    });
  }, [sortedVaccinations, searchQuery, statusFilter]);

  const totalDoses = vaccinations.reduce((sum, v) => sum + (v.doseNumber || 1), 0);
  const uniqueVaccines = new Set(vaccinations.map((v) => v.vaccineName)).size;
  const upcomingDue = vaccinations.filter(
    (v) => v.nextDueDate && v.nextDueDate > new Date().toISOString().split('T')[0]
  );

  // Coverage calculation
  const commonVaccines = [
    { name: 'COVID-19', required: 2, icon: '🦠' },
    { name: 'Hepatitis B', required: 3, icon: '🔬' },
    { name: 'Tetanus', required: 1, icon: '💉' },
    { name: 'Influenza', required: 1, icon: '🤧' },
  ];

  const getVaccineColor = (index: number) => {
    const colors = ['#10B981', '#06B6D4', '#4F46E5', '#F5A623', '#EC4899'];
    return colors[index % colors.length];
  };

  const handleCardClick = (vac: Vaccination) => {
    soundFX.playClick();
    const doc = documents.find((d) => d.documentId === vac.documentId) || {
      documentId: vac.documentId,
      userId: vac.userId,
      type: 'vaccination',
      imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
      uploadedAt: vac.dateAdministered,
      ocrStatus: 'success',
      confidenceScore: 99.1,
      rawOcrText: `VACCINATION CERTIFICATE: ${vac.vaccineName}\nDose: ${vac.doseNumber || 1}\nAdministered: ${vac.dateAdministered}\nFacility: ${vac.facility}`,
    };

    const item: TimelineItem = {
      id: `item_${vac.vaccinationId}`,
      documentId: vac.documentId,
      type: 'vaccination',
      title: vac.vaccineName,
      subtitle: `Dose ${vac.doseNumber || 1} · ${vac.facility || 'Health Center'}`,
      date: vac.dateAdministered,
      sourceFacility: vac.facility || 'Health Center',
      valueDisplay: `Dose ${vac.doseNumber || 1} Administered`,
      referenceRange: vac.nextDueDate ? `Booster Due: ${vac.nextDueDate}` : 'Completed Series',
      isFlagged: false,
      manuallyCorrected: false,
      ocrConfidence: doc.confidenceScore || 99,
      document: doc,
      rawPayload: vac,
    };

    onSelectRecord(item);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Vaccination & Immunization History</h2>
          <p className="page-subtitle">
            Consolidated immunization certificates across hospitals with upcoming booster tracking
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
            <span>Upload Vaccine Card</span>
          </button>
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
            <div className="vac-stat-label">Total Doses Administered</div>
          </div>
        </div>
        <div className="vac-stat-card">
          <div className="vac-stat-icon" style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="vac-stat-value">{uniqueVaccines}</div>
            <div className="vac-stat-label">Unique Vaccine Series</div>
          </div>
        </div>
        <div className="vac-stat-card">
          <div className="vac-stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="vac-stat-value">{upcomingDue.length}</div>
            <div className="vac-stat-label">Upcoming Boosters Due</div>
          </div>
        </div>
      </div>

      {/* Immunization Coverage Cards */}
      <div className="vac-coverage-section">
        <h3 className="section-title">Immunization Coverage Status</h3>
        <div className="vac-coverage-grid">
          {commonVaccines.map((cv, idx) => {
            const received = vaccinations.filter((v) =>
              v.vaccineName.toLowerCase().includes(cv.name.toLowerCase())
            );
            const coverage = Math.min(100, Math.round((received.length / cv.required) * 100));
            const radius = 30;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - circumference * (coverage / 100);

            return (
              <div key={cv.name} className="ui-card vac-coverage-card">
                <div className="vac-coverage-top">
                  <span className="vac-emoji">{cv.icon}</span>
                  <span className="vac-coverage-name">{cv.name}</span>
                </div>

                <div className="vac-coverage-ring">
                  <svg width="76" height="76" viewBox="0 0 76 76">
                    <circle
                      cx="38"
                      cy="38"
                      r={radius}
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="6"
                    />
                    <circle
                      cx="38"
                      cy="38"
                      r={radius}
                      fill="transparent"
                      stroke={getVaccineColor(idx)}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '38px 38px',
                        transition: 'stroke-dashoffset 0.8s ease',
                      }}
                    />
                  </svg>
                  <div className="vac-coverage-percent">{coverage}%</div>
                </div>

                <div className="vac-coverage-status">
                  {coverage >= 100 ? (
                    <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> Complete
                    </span>
                  ) : (
                    <span style={{ color: '#F5A623', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={13} /> {received.length} of {cv.required} Doses
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {(
            [
              { id: 'all', label: 'All Records' },
              { id: 'completed', label: 'Completed Series' },
              { id: 'due', label: 'Boosters Due' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: statusFilter === t.id ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                backgroundColor: statusFilter === t.id ? '#EEF2FF' : '#FFFFFF',
                color: statusFilter === t.id ? '#4F46E5' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper" style={{ width: '250px' }}>
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            style={{ height: '36px', fontSize: '12px' }}
            placeholder="Search vaccines, facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Vaccination Cards Grid */}
      {filteredVaccinations.length === 0 ? (
        <div className="ui-card" style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Syringe size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            No Immunization Certificates Digitized Yet
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
            Upload pediatric or adult vaccination certificates across hospitals to track booster schedules and WHO immunization coverage.
          </p>
          <button className="btn-primary" onClick={onOpenUpload} style={{ marginTop: '8px', padding: '8px 18px', fontSize: '13px' }}>
            Upload Vaccine Card
          </button>
        </div>
      ) : (
        <div className="vac-list-grid">
          {filteredVaccinations.map((vac) => {
          const isDue = vac.nextDueDate && vac.nextDueDate > new Date().toISOString().split('T')[0];

          return (
            <div
              key={vac.vaccinationId}
              className="ui-card vac-card"
              onClick={() => handleCardClick(vac)}
              style={{ cursor: 'pointer' }}
            >
              <div className="vac-card-top">
                <div className="vac-icon-badge">
                  <Syringe size={18} />
                </div>
                {isDue ? (
                  <span className="status-pill flag-moderate">
                    <Clock size={12} />
                    <span>Booster Due</span>
                  </span>
                ) : (
                  <span className="status-pill normal">
                    <CheckCircle2 size={12} />
                    <span>Verified Dose</span>
                  </span>
                )}
              </div>

              <div className="vac-name">{vac.vaccineName}</div>
              <div className="vac-dose-tag">Dose {vac.doseNumber || 1} Administered</div>

              <div className="vac-meta">
                <div className="vac-meta-item">
                  <Calendar size={13} />
                  <span>
                    Given on{' '}
                    {new Date(vac.dateAdministered).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="vac-meta-item">
                  <Building2 size={13} />
                  <span>{vac.facility || 'Healthcare Center'}</span>
                </div>
                {vac.nextDueDate && (
                  <div className="vac-meta-item" style={{ color: isDue ? '#D97706' : '#64748B' }}>
                    <Clock size={13} />
                    <span>
                      Next Due:{' '}
                      {new Date(vac.nextDueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
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
                <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Certificate Digitized
                </span>
                <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} /> View Certificate
                </span>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
