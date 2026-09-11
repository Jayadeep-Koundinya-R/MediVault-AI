import React, { useState } from 'react';
import { FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Eye, Minus } from 'lucide-react';
import { initialLabResults, initialRiskFlags } from '../data/mockHealthData';

interface LabReportsPageProps {
  onSelectRecord?: (item: any) => void;
}

export const LabReportsPage: React.FC<LabReportsPageProps> = ({ onSelectRecord }) => {
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');

  const labs = [...initialLabResults].sort((a, b) => {
    if (sortBy === 'date') return b.testDate.localeCompare(a.testDate);
    if (sortBy === 'name') return a.testName.localeCompare(b.testName);
    // status: flagged first
    const aFlag = initialRiskFlags.find(f => f.labResultId === a.labResultId);
    const bFlag = initialRiskFlags.find(f => f.labResultId === b.labResultId);
    return (bFlag ? 1 : 0) - (aFlag ? 1 : 0);
  });

  // Group labs by test name for trend mini-charts
  const testGroups: Record<string, typeof initialLabResults> = {};
  initialLabResults.forEach(lab => {
    if (!testGroups[lab.testName]) testGroups[lab.testName] = [];
    testGroups[lab.testName].push(lab);
  });

  const getStatusBadge = (lab: typeof initialLabResults[0]) => {
    const flag = initialRiskFlags.find(f => f.labResultId === lab.labResultId);
    if (flag) {
      return (
        <span className="status-pill flag-high">
          <AlertTriangle size={12} />
          <span>{flag.severity === 'high' ? 'Flagged' : 'Borderline'}</span>
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

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Lab Reports</h2>
          <p className="page-subtitle">All laboratory test results extracted from scanned documents across hospitals</p>
        </div>
        <div className="page-header-actions">
          <div className="sort-dropdown">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="date">Date (Latest)</option>
              <option value="name">Test Name</option>
              <option value="status">Risk Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="lab-stats-row">
        <div className="lab-stat-card">
          <div className="lab-stat-value">{labs.length}</div>
          <div className="lab-stat-label">Total Tests</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#DC2626' }}>
            {labs.filter(l => initialRiskFlags.some(f => f.labResultId === l.labResultId)).length}
          </div>
          <div className="lab-stat-label">Flagged</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#10B981' }}>
            {labs.filter(l => !initialRiskFlags.some(f => f.labResultId === l.labResultId)).length}
          </div>
          <div className="lab-stat-label">Normal</div>
        </div>
        <div className="lab-stat-card">
          <div className="lab-stat-value" style={{ color: '#6366F1' }}>
            {Object.keys(testGroups).length}
          </div>
          <div className="lab-stat-label">Unique Tests</div>
        </div>
      </div>

      {/* Test Trend Cards */}
      <div className="lab-trend-cards">
        {Object.entries(testGroups).map(([testName, results]) => {
          const sorted = [...results].sort((a, b) => a.testDate.localeCompare(b.testDate));
          const latest = sorted[sorted.length - 1];
          const refRange = latest.referenceRangeLow && latest.referenceRangeHigh
            ? `${latest.referenceRangeLow}–${latest.referenceRangeHigh} ${latest.unit}`
            : 'Standard';

          return (
            <div key={testName} className="ui-card lab-trend-card">
              <div className="lab-trend-header">
                <div className="lab-trend-icon">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="lab-trend-name">{testName}</div>
                  <div className="lab-trend-range">Ref: {refRange}</div>
                </div>
                {getTrendIcon(testName)}
              </div>

              {/* Mini sparkline */}
              <div className="lab-trend-sparkline">
                <svg viewBox="0 0 120 40" className="sparkline-svg">
                  {sorted.length > 1 && (() => {
                    const minV = Math.min(...sorted.map(s => s.value)) * 0.9;
                    const maxV = Math.max(...sorted.map(s => s.value)) * 1.1;
                    const pts = sorted.map((s, i) => {
                      const x = (i / (sorted.length - 1)) * 110 + 5;
                      const y = 35 - ((s.value - minV) / (maxV - minV)) * 30;
                      return `${x},${y}`;
                    });
                    return (
                      <polyline
                        points={pts.join(' ')}
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })()}
                  {sorted.map((s, i) => {
                    const minV = Math.min(...sorted.map(s2 => s2.value)) * 0.9;
                    const maxV = Math.max(...sorted.map(s2 => s2.value)) * 1.1;
                    const x = sorted.length > 1 ? (i / (sorted.length - 1)) * 110 + 5 : 60;
                    const y = sorted.length > 1 ? 35 - ((s.value - minV) / (maxV - minV)) * 30 : 20;
                    const isCrit = initialRiskFlags.some(f => f.labResultId === s.labResultId);
                    return (
                      <circle key={i} cx={x} cy={y} r="3"
                        fill={isCrit ? '#EF4444' : '#3B82F6'}
                        stroke="#fff" strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="lab-trend-latest">
                <span className="lab-trend-latest-value">{latest.value} {latest.unit}</span>
                <span className="lab-trend-latest-date">
                  {new Date(latest.testDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Lab Table */}
      <div className="records-table-card">
        <div className="table-responsive">
          <table className="records-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Value</th>
                <th>Reference Range</th>
                <th>Source Lab</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab.labResultId} className="record-row" onClick={() => onSelectRecord?.(lab)}>
                  <td>
                    <div className="record-title-cell">
                      <div className="record-type-icon lab">
                        <FileText size={16} />
                      </div>
                      <span className="record-main-title">{lab.testName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: initialRiskFlags.some(f => f.labResultId === lab.labResultId) ? '#DC2626' : 'var(--text-primary)'
                    }}>
                      {lab.value} {lab.unit}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {lab.referenceRangeLow && lab.referenceRangeHigh
                      ? `${lab.referenceRangeLow}–${lab.referenceRangeHigh} ${lab.unit}`
                      : '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {lab.sourceLab || 'Unknown'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {new Date(lab.testDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>{getStatusBadge(lab)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-view-scan" onClick={(e) => { e.stopPropagation(); onSelectRecord?.(lab); }}>
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
