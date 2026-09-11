import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Minus,
  Plus,
  Search,
} from 'lucide-react';
import { LabResult, RiskFlag, HealthDocument, TimelineItem } from '../types';
import { soundFX } from '../utils/audioEffects';

interface LabReportsPageProps {
  labs: LabResult[];
  riskFlags: RiskFlag[];
  documents: HealthDocument[];
  onSelectRecord: (item: TimelineItem) => void;
  onOpenUpload: () => void;
}

export const LabReportsPage: React.FC<LabReportsPageProps> = ({
  labs,
  riskFlags,
  documents,
  onSelectRecord,
  onOpenUpload,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'metabolic' | 'lipid' | 'renal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter by category and search query
  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        lab.testName.toLowerCase().includes(q) ||
        (lab.sourceLab && lab.sourceLab.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      const n = lab.testName.toLowerCase();
      if (categoryFilter === 'metabolic') return n.includes('glucose') || n.includes('hba1c') || n.includes('sugar');
      if (categoryFilter === 'lipid') return n.includes('cholesterol') || n.includes('triglyceride') || n.includes('lipid');
      if (categoryFilter === 'renal') return n.includes('creatinine') || n.includes('urea') || n.includes('bun');
      return true;
    });
  }, [labs, categoryFilter, searchQuery]);

  // Sort labs
  const sortedLabs = useMemo(() => {
    return [...filteredLabs].sort((a, b) => {
      if (sortBy === 'date') return b.testDate.localeCompare(a.testDate);
      if (sortBy === 'name') return a.testName.localeCompare(b.testName);
      // Risk status: flagged first
      const aFlag = riskFlags.find((f) => f.labResultId === a.labResultId);
      const bFlag = riskFlags.find((f) => f.labResultId === b.labResultId);
      return (bFlag ? 1 : 0) - (aFlag ? 1 : 0);
    });
  }, [filteredLabs, sortBy, riskFlags]);

  // Group labs by test name for trend detection
  const testGroups = useMemo(() => {
    const groups: Record<string, LabResult[]> = {};
    labs.forEach((lab) => {
      if (!groups[lab.testName]) groups[lab.testName] = [];
      groups[lab.testName].push(lab);
    });
    return groups;
  }, [labs]);

  const getStatusBadge = (lab: LabResult) => {
    const flag = riskFlags.find((f) => f.labResultId === lab.labResultId);
    if (flag) {
      return (
        <span className="status-pill flag-high">
          <AlertTriangle size={12} />
          <span>{flag.severity === 'high' ? 'Clinical Flag' : 'Borderline'}</span>
        </span>
      );
    }
    if (lab.referenceRangeHigh && lab.value > lab.referenceRangeHigh) {
      return (
        <span className="status-pill flag-moderate">
          <AlertTriangle size={12} />
          <span>Elevated</span>
        </span>
      );
    }
    return (
      <span className="status-pill normal">
        <CheckCircle2 size={12} />
        <span>Normal</span>
      </span>
    );
  };

  const getTrendIcon = (testName: string) => {
    const group = testGroups[testName];
    if (!group || group.length < 2) return <Minus size={14} color="#94A3B8" />;
    const sorted = [...group].sort((a, b) => a.testDate.localeCompare(b.testDate));
    const last = sorted[sorted.length - 1].value;
    const prev = sorted[sorted.length - 2].value;
    if (last > prev) return <TrendingUp size={14} color="#DC2626" />;
    if (last < prev) return <TrendingDown size={14} color="#10B981" />;
    return <Minus size={14} color="#94A3B8" />;
  };

  const handleRowClick = (lab: LabResult) => {
    soundFX.playClick();
    const doc = documents.find((d) => d.documentId === lab.documentId) || {
      documentId: lab.documentId,
      userId: lab.userId,
      type: 'lab_report',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      uploadedAt: lab.testDate,
      ocrStatus: 'success',
      confidenceScore: 97.4,
      rawOcrText: `LABORATORY REPORT: ${lab.testName}\nValue: ${lab.value} ${lab.unit}\nDate: ${lab.testDate}\nFacility: ${lab.sourceLab}`,
    };

    const flag = riskFlags.find((f) => f.labResultId === lab.labResultId);

    const item: TimelineItem = {
      id: `item_${lab.labResultId}`,
      documentId: lab.documentId,
      type: 'lab_report',
      title: lab.testName,
      subtitle: `${lab.sourceLab || 'Diagnostic Lab'} · Verified`,
      date: lab.testDate,
      sourceFacility: lab.sourceLab || 'Diagnostic Lab',
      valueDisplay: `${lab.value} ${lab.unit}`,
      referenceRange: lab.referenceRangeLow && lab.referenceRangeHigh ? `${lab.referenceRangeLow} - ${lab.referenceRangeHigh} ${lab.unit}` : undefined,
      isFlagged: Boolean(flag),
      flagSeverity: flag?.severity,
      flagRule: flag?.thresholdDescription,
      manuallyCorrected: lab.manuallyCorrected,
      ocrConfidence: doc.confidenceScore || 96,
      document: doc,
      rawPayload: lab,
    };

    onSelectRecord(item);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Lab Reports & Blood Panels</h2>
          <p className="page-subtitle">
            All laboratory test results parsed via OCR from scanned documents across hospitals
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
            <span>Upload Lab Report</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="lab-stats-row">
        <div className="lab-stat-card">
          <div className="lab-stat-value">{labs.length}</div>
          <div className="lab-stat-label">Total Tests Extracted</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#DC2626' }}>
            {labs.filter((l) => riskFlags.some((f) => f.labResultId === l.labResultId)).length}
          </div>
          <div className="lab-stat-label">Clinical Flags (ADA/WHO)</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#10B981' }}>
            {labs.filter((l) => !riskFlags.some((f) => f.labResultId === l.labResultId)).length}
          </div>
          <div className="lab-stat-label">Within Target Range</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#6366F1' }}>
            {new Set(labs.map((l) => l.sourceLab || 'Default')).size}
          </div>
          <div className="lab-stat-label">Contributing Hospitals</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'all', label: 'All Tests' },
              { id: 'metabolic', label: 'Metabolic & Diabetes' },
              { id: 'lipid', label: 'Lipid Profile' },
              { id: 'renal', label: 'Kidney / Renal' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: categoryFilter === c.id ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                backgroundColor: categoryFilter === c.id ? '#EEF2FF' : '#FFFFFF',
                color: categoryFilter === c.id ? '#4F46E5' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ width: '220px' }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              style={{ height: '36px', fontSize: '12px' }}
              placeholder="Filter by test name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-dropdown">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
            >
              <option value="date">Sort: Latest Date</option>
              <option value="name">Sort: Test Name</option>
              <option value="status">Sort: Risk Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Results Table Card */}
      <div className="ui-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="timeline-table-container">
          <table className="timeline-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result Value</th>
                <th>Reference Range</th>
                <th>Trend</th>
                <th>Clinical Status</th>
                <th>Hospital / Facility</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLabs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                        {labs.length === 0 ? 'No Lab Reports Digitized Yet' : 'No matching lab records found'}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
                        {labs.length === 0
                          ? 'Upload blood tests, metabolic panels, or lipid profile reports from Apollo, Fortis, or Max Healthcare to track biomarker trends.'
                          : 'Try changing your search term or category filter.'}
                      </p>
                      {labs.length === 0 && (
                        <button className="btn-primary" onClick={onOpenUpload} style={{ marginTop: '8px', padding: '8px 18px', fontSize: '13px' }}>
                          Upload Lab Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedLabs.map((lab) => {
                const flag = riskFlags.find((f) => f.labResultId === lab.labResultId);
                const hasRange = lab.referenceRangeLow && lab.referenceRangeHigh;

                return (
                  <tr
                    key={lab.labResultId}
                    onClick={() => handleRowClick(lab)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: flag ? '#FEE2E2' : '#EEF2FF',
                            color: flag ? '#DC2626' : '#4F46E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>
                            {lab.testName}
                          </div>
                          {lab.manuallyCorrected && (
                            <span style={{ fontSize: '10.5px', color: '#6366F1', fontWeight: 600 }}>
                              Manually Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          color: flag ? '#DC2626' : '#1E293B',
                        }}
                      >
                        {lab.value} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>{lab.unit}</span>
                      </span>
                    </td>

                    <td>
                      {hasRange ? (
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {lab.referenceRangeLow} – {lab.referenceRangeHigh} {lab.unit}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>Standard</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getTrendIcon(lab.testName)}
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {testGroups[lab.testName]?.length > 1 ? `${testGroups[lab.testName].length} pts` : 'Initial'}
                        </span>
                      </div>
                    </td>

                    <td>{getStatusBadge(lab)}</td>

                    <td>
                      <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                        {lab.sourceLab || 'Hospital Lab'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {new Date(lab.testDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(lab);
                        }}
                        style={{
                          fontSize: '12px',
                          color: '#4F46E5',
                          fontWeight: 600,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        View Scan
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
