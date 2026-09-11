import React from 'react';
import { TimelineItem, RiskFlag } from '../types';

interface StatsCardsProps {
  timelineItems: TimelineItem[];
  riskFlags: RiskFlag[];
  onFilterFlagged: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ timelineItems, riskFlags, onFilterFlagged }) => {
  const totalCount = timelineItems.length;
  const labCount = timelineItems.filter((i) => i.type === 'lab_report').length;
  const rxCount = timelineItems.filter((i) => i.type === 'prescription').length;
  const vacCount = timelineItems.filter((i) => i.type === 'vaccination').length;
  const flaggedCount = timelineItems.filter((i) => i.isFlagged).length;

  const manuallyCorrectedCount = timelineItems.filter((i) => i.manuallyCorrected).length;
  const highConfidenceCount = totalCount - manuallyCorrectedCount;
  const precisionPercent = totalCount > 0 ? Math.round((highConfidenceCount / totalCount) * 100) : 100;

  // SVG Donut calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const digitizeOffset = circumference - (circumference * 0.85);

  return (
    <div className="metrics-stack">
      {/* Metric Card 1: Records Digitized (Matching "Cash in" donut) */}
      <div className="ui-card metric-card">
        <div className="metric-info">
          <span className="metric-label">Digitized History</span>
          <div className="metric-value">{totalCount} <span style={{ fontSize: '15px', fontWeight: 600, color: '#8E98B4' }}>Records</span></div>
          <div className="metric-sub">
            <span style={{ color: '#059669', fontWeight: 700 }}>{labCount} Labs</span> · 
            <span style={{ color: '#7C3AED', fontWeight: 700 }}> {rxCount} Rx</span> · 
            <span style={{ color: '#0284C7', fontWeight: 700 }}> {vacCount} Vac</span>
          </div>
        </div>

        <div className="donut-container">
          <svg className="donut-svg" width="90" height="90" viewBox="0 0 90 90">
            <circle
              className="donut-bg"
              cx="45"
              cy="45"
              r={radius}
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              className="donut-bar"
              cx="45"
              cy="45"
              r={radius}
              strokeWidth="9"
              stroke="#F5A623"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={digitizeOffset}
            />
          </svg>
          <div className="donut-center-text" style={{ color: '#F5A623' }}>
            {totalCount}
          </div>
        </div>
      </div>

      {/* Metric Card 2: OCR Quality & Risk (Matching "Cash out" donut) */}
      <div 
        className="ui-card metric-card" 
        style={{ cursor: 'pointer' }}
        onClick={onFilterFlagged}
        title="Click to filter risk flagged records"
      >
        <div className="metric-info">
          <span className="metric-label">Clinical Risk Flags</span>
          <div className="metric-value" style={{ color: flaggedCount > 0 ? '#DC2626' : '#10B981' }}>
            {flaggedCount} <span style={{ fontSize: '15px', fontWeight: 600, color: '#8E98B4' }}>Active</span>
          </div>
          <div className="metric-sub">
            <span>{riskFlags.filter((f) => f.severity === 'high').length} High</span> · 
            <span> {riskFlags.filter((f) => f.severity === 'moderate').length} Moderate</span>
          </div>
        </div>

        <div className="donut-container">
          <svg className="donut-svg" width="90" height="90" viewBox="0 0 90 90">
            <circle
              className="donut-bg"
              cx="45"
              cy="45"
              r={radius}
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              className="donut-bar"
              cx="45"
              cy="45"
              r={radius}
              strokeWidth="9"
              stroke="#DC2626"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * (flaggedCount / Math.max(totalCount, 1)))}
            />
          </svg>
          <div className="donut-center-text" style={{ color: '#DC2626' }}>
            {flaggedCount}
          </div>
        </div>
      </div>

      {/* Bottom Mini Pillar Bar Indicators (Replicating bottom-left vertical pillars from Flat-21 illustration) */}
      <div 
        className="ui-card" 
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            OCR Confidence Index
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669' }}>
            {precisionPercent}% Precision
          </span>
        </div>

        {/* Vertical pillar bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '48px', paddingTop: '6px' }}>
          {[
            { height: '65%', color: '#38BDF8', label: 'Jan' },
            { height: '75%', color: '#38BDF8', label: 'Feb' },
            { height: '55%', color: '#F5A623', label: 'Mar*' },
            { height: '88%', color: '#38BDF8', label: 'Apr' },
            { height: '92%', color: '#38BDF8', label: 'May' },
            { height: '95%', color: '#38BDF8', label: 'Jun' },
            { height: '98%', color: '#38BDF8', label: 'Aug' },
          ].map((bar, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div 
                style={{ 
                  width: '8px', 
                  height: bar.height, 
                  backgroundColor: bar.color, 
                  borderRadius: '4px',
                  transition: 'height 0.3s ease'
                }} 
              />
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>{bar.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
          * Mar record manually corrected (handwritten Rx)
        </div>
      </div>
    </div>
  );
};
