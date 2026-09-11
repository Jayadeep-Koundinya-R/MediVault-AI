import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ChevronRight, TrendingUp } from 'lucide-react';
import { biomarkerTrendSeries } from '../data/mockHealthData';

interface BiomarkerTrendChartProps {
  onOpenSummaryModal: () => void;
  onOpenFlagDetails: () => void;
  hasData?: boolean;
  onOpenUpload?: () => void;
}

export const BiomarkerTrendChart: React.FC<BiomarkerTrendChartProps> = ({
  onOpenSummaryModal,
  onOpenFlagDetails,
  hasData = false,
  onOpenUpload,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (!hasData || biomarkerTrendSeries.length === 0) {
    return (
      <div className="ui-card trend-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '320px', padding: '32px 24px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <TrendingUp size={26} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          No Biomarker Trends Digitized Yet
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
          Upload your fasting blood glucose, HbA1c, or lipid reports across Apollo, Fortis, or Max Healthcare to activate longitudinal trend synthesis across hospitals.
        </p>
        {onOpenUpload && (
          <button className="btn-primary" onClick={onOpenUpload} style={{ padding: '9px 18px', fontSize: '13px' }}>
            Upload First Lab Report
          </button>
        )}
      </div>
    );
  }

  // SVG coordinate configuration
  const width = 640;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Domain: Fasting Glucose between 90 and 150 mg/dL
  const minY = 95;
  const maxY = 150;

  const getX = (index: number) => {
    return paddingLeft + (index / (biomarkerTrendSeries.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
  };

  // ADA Threshold at 126 mg/dL
  const thresholdY = getY(126);

  // Generate SVG path for Fasting Glucose (Gold line)
  const points = biomarkerTrendSeries.map((d, i) => ({ x: getX(i), y: getY(d.fastingGlucose) }));
  
  // Create smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY1 = points[i].y;
    const cpX2 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY2 = points[i + 1].y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  // Area path closing down to bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Secondary Cyan curve (HbA1c factor equivalent)
  const cyanPoints = biomarkerTrendSeries.map((d, i) => ({ x: getX(i), y: getY(d.hba1cFactor) }));
  let cyanPathD = `M ${cyanPoints[0].x} ${cyanPoints[0].y}`;
  for (let i = 0; i < cyanPoints.length - 1; i++) {
    const cpX1 = cyanPoints[i].x + (cyanPoints[i + 1].x - cyanPoints[i].x) / 2;
    const cpY1 = cyanPoints[i].y;
    const cpX2 = points[i].x + (cyanPoints[i + 1].x - cyanPoints[i].x) / 2;
    const cpY2 = cyanPoints[i + 1].y;
    cyanPathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${cyanPoints[i + 1].x} ${cyanPoints[i + 1].y}`;
  }

  return (
    <div className="ui-card trend-card">
      {/* Card Header matching reference */}
      <div className="card-header-row">
        <div className="card-title-group">
          <h3>Biomarker Trend & Clinical Forecast</h3>
          <p>Longitudinal Fasting Blood Glucose (mg/dL) across Apollo, Fortis & Max Healthcare</p>
        </div>

        <div className="pastel-dots">
          <span className="pastel-dot peach" />
          <span className="pastel-dot lilac" />
          <span className="pastel-dot cyan" />
          <span className="pastel-dot gold" />
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="trend-chart-header">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot gold" />
            <span>Fasting Glucose (mg/dL)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot cyan" />
            <span>HbA1c Trend Index</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot danger" />
            <span>ADA Threshold &ge; 126 mg/dL</span>
          </div>
        </div>
      </div>

      {/* Floating "AI Health Statement" Card (Replicating "Balance Statement" in reference) */}
      <div className="floating-ai-card">
        <div className="floating-card-header">
          <div className="floating-card-title">
            <Sparkles size={16} color="#7B73F6" />
            <span>AI Health Insight</span>
          </div>
          <span className="floating-card-badge">LLM Trend</span>
        </div>

        <p className="floating-card-body">
          Progressive upward trend detected across 3 lab panels: Fasting glucose escalated from 110 &rarr; 122 &rarr; 138 mg/dL.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="floating-card-trend-badge">
            <TrendingUp size={13} />
            +25.4% Escalation
          </span>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Crossed ADA Cutoff</span>
        </div>

        <div className="floating-card-footer">
          <button 
            id="btn-view-ai-summary"
            className="btn-link-action" 
            onClick={onOpenSummaryModal}
          >
            <span>Read Complete Summary</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Floating Risk Alert Pill (Bottom Left) */}
      <div className="floating-alert-card" onClick={onOpenFlagDetails} style={{ cursor: 'pointer' }}>
        <div className="floating-alert-icon">
          <AlertTriangle size={18} />
        </div>
        <div className="floating-alert-text">
          <strong>ADA Diagnostic Flag Triggered</strong>
          <span>Fasting Glucose 138 mg/dL &ge; 126 mg/dL (Apollo 20-Aug)</span>
        </div>
      </div>

      {/* SVG Canvas with Drop Pillars matching Flat-21 Illustration */}
      <div className="chart-container">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Amber gradient matching reference */}
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#F5A623" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="pillarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#EDF2FA"
            strokeWidth="1.5"
          />

          {/* ADA Reference Line at 126 mg/dL */}
          <line
            x1={paddingLeft}
            y1={thresholdY}
            x2={width - paddingRight}
            y2={thresholdY}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={width - paddingRight - 8}
            y={thresholdY - 6}
            fill="#DC2626"
            fontSize="10.5"
            fontWeight="700"
            textAnchor="end"
          >
            ADA Cutoff: 126 mg/dL
          </text>

          {/* Area under gold curve */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Vertical Drop Pillars under each data node (exact Flat-21 aesthetic) */}
          {points.map((p, i) => (
            <g key={i}>
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={paddingTop + chartHeight}
                stroke="url(#pillarGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity={hoveredPoint === i ? 0.9 : 0.4}
              />
            </g>
          ))}

          {/* Cyan secondary curve */}
          <path
            d={cyanPathD}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Main Gold Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#F5A623"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Data Node Dots (Blue/White as seen in Flat-21 reference) */}
          {points.map((p, i) => {
            const data = biomarkerTrendSeries[i];
            const isCritical = data.fastingGlucose >= 126;
            const isHovered = hoveredPoint === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Halo when hovered */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill={isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}
                  />
                )}

                {/* Outer circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="#FFFFFF"
                  stroke={isCritical ? '#EF4444' : '#3B82F6'}
                  strokeWidth="3"
                />

                {/* Value tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 55}
                      y={p.y - 42}
                      width="110"
                      height="32"
                      rx="6"
                      fill="#1E2238"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                    />
                    <text
                      x={p.x}
                      y={p.y - 22}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {data.fastingGlucose} mg/dL ({data.month})
                    </text>
                  </g>
                )}

                {/* X-axis labels */}
                <text
                  x={p.x}
                  y={paddingTop + chartHeight + 20}
                  fill="#8E98B4"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {data.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
