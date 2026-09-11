import React from 'react';
import { TimelineItem, DocumentType } from '../types';
import { FileText, Pill, Syringe, AlertTriangle, CheckCircle2, Eye, ShieldAlert } from 'lucide-react';

interface RecordsTimelineProps {
  items: TimelineItem[];
  currentFilter: string;
  setCurrentFilter: (f: string) => void;
  onSelectRecord: (item: TimelineItem) => void;
}

export const RecordsTimeline: React.FC<RecordsTimelineProps> = ({
  items,
  currentFilter,
  setCurrentFilter,
  onSelectRecord,
}) => {
  // Compute counts for tabs
  const allCount = items.length;
  const labCount = items.filter((i) => i.type === 'lab_report').length;
  const rxCount = items.filter((i) => i.type === 'prescription').length;
  const vacCount = items.filter((i) => i.type === 'vaccination').length;
  const flaggedCount = items.filter((i) => i.isFlagged).length;

  const filteredItems = items.filter((item) => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'lab_report') return item.type === 'lab_report';
    if (currentFilter === 'prescription') return item.type === 'prescription';
    if (currentFilter === 'vaccination') return item.type === 'vaccination';
    if (currentFilter === 'flagged') return item.isFlagged;
    return true;
  });

  const getRecordIcon = (type: DocumentType) => {
    switch (type) {
      case 'lab_report':
        return <FileText size={18} />;
      case 'prescription':
        return <Pill size={18} />;
      case 'vaccination':
        return <Syringe size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const getIconClass = (type: DocumentType) => {
    switch (type) {
      case 'lab_report':
        return 'lab';
      case 'prescription':
        return 'prescription';
      case 'vaccination':
        return 'vaccination';
      default:
        return 'lab';
    }
  };

  return (
    <section className="timeline-section" aria-label="Consolidated Timeline">
      <div className="timeline-header-bar">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Consolidated Medical Timeline
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Unified records across Apollo, Max Healthcare, and Fortis Clinics
          </p>
        </div>

        {/* Tab Filters */}
        <div className="timeline-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={currentFilter === 'all'}
            className={`timeline-tab-btn ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('all')}
          >
            <span>All Records</span>
            <span className="tab-count-pill">{allCount}</span>
          </button>

          <button
            role="tab"
            aria-selected={currentFilter === 'lab_report'}
            className={`timeline-tab-btn ${currentFilter === 'lab_report' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('lab_report')}
          >
            <span>Lab Reports</span>
            <span className="tab-count-pill">{labCount}</span>
          </button>

          <button
            role="tab"
            aria-selected={currentFilter === 'prescription'}
            className={`timeline-tab-btn ${currentFilter === 'prescription' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('prescription')}
          >
            <span>Prescriptions</span>
            <span className="tab-count-pill">{rxCount}</span>
          </button>

          <button
            role="tab"
            aria-selected={currentFilter === 'vaccination'}
            className={`timeline-tab-btn ${currentFilter === 'vaccination' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('vaccination')}
          >
            <span>Vaccinations</span>
            <span className="tab-count-pill">{vacCount}</span>
          </button>

          <button
            role="tab"
            aria-selected={currentFilter === 'flagged'}
            className={`timeline-tab-btn ${currentFilter === 'flagged' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('flagged')}
          >
            <span style={{ color: currentFilter === 'flagged' ? '#FFFFFF' : '#DC2626' }}>
              Risk Flags
            </span>
            <span className="tab-count-pill" style={{ color: currentFilter === 'flagged' ? '#FFFFFF' : '#DC2626' }}>
              {flaggedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Records Table (Matching Flat-21 "Sales Orders" styling) */}
      <div className="records-table-card">
        <div className="table-responsive">
          <table className="records-table">
            <thead>
              <tr>
                <th>Record Details</th>
                <th>Source Hospital / Lab</th>
                <th>Date</th>
                <th>Extracted Value / Dose</th>
                <th>Ref Range / Schedule</th>
                <th>OCR Confidence</th>
                <th>Clinical Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="record-row"
                      onClick={() => onSelectRecord(item)}
                    >
                      {/* Title & Icon */}
                      <td>
                        <div className="record-title-cell">
                          <div className={`record-type-icon ${getIconClass(item.type)}`}>
                            {getRecordIcon(item.type)}
                          </div>
                          <div className="record-info-text">
                            <span className="record-main-title">{item.title}</span>
                            <span className="record-facility-sub">{item.subtitle}</span>
                          </div>
                        </div>
                      </td>

                      {/* Source Facility */}
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {item.sourceFacility}
                      </td>

                      {/* Date */}
                      <td style={{ fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(item.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Value / Dosage */}
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.valueDisplay}
                        </span>
                      </td>

                      {/* Reference Range */}
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {item.referenceRange || '—'}
                      </td>

                      {/* OCR Confidence */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span
                            className={`ocr-confidence-badge ${
                              item.ocrConfidence >= 90 ? 'high' : 'warning'
                            }`}
                          >
                            {item.ocrConfidence >= 90 ? (
                              <CheckCircle2 size={12} color="#059669" />
                            ) : (
                              <AlertTriangle size={12} color="#D97706" />
                            )}
                            <span>{item.ocrConfidence}%</span>
                          </span>
                          {item.manuallyCorrected && (
                            <span className="corrected-tag" title="Field was manually corrected by user after OCR">
                              Corrected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Clinical Status */}
                      <td>
                        {item.isFlagged ? (
                          <span className={`status-pill ${item.flagSeverity === 'high' ? 'flag-high' : 'flag-moderate'}`}>
                            <ShieldAlert size={12} />
                            <span>{item.flagSeverity === 'high' ? 'Flagged (ADA High)' : 'Borderline'}</span>
                          </span>
                        ) : item.type === 'lab_report' ? (
                          <span className="status-pill normal">
                            <CheckCircle2 size={12} />
                            <span>Normal</span>
                          </span>
                        ) : item.type === 'prescription' ? (
                          <span className="status-pill active-rx">
                            <Pill size={12} />
                            <span>Active Rx</span>
                          </span>
                        ) : (
                          <span className="status-pill vaccine-ok">
                            <CheckCircle2 size={12} />
                            <span>Immunized</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-view-scan"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(item);
                          }}
                          title="Inspect OCR fields & original scan"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
