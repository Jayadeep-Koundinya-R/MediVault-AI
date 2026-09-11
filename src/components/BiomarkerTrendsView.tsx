import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { LabResult, RiskFlag } from '../types';
import { soundFX } from '../utils/audioEffects';

interface BiomarkerTrendsViewProps {
  labResults: LabResult[];
  riskFlags: RiskFlag[];
  onOpenSummary: () => void;
  onOpenUpload: () => void;
  onSelectRecord?: (item: any) => void;
}

interface MetricConfig {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  highThreshold: number;
  guideline: string;
  icon: string;
  description: string;
}

const METRIC_CONFIGS: MetricConfig[] = [
  {
    id: 'glucose',
    name: 'Fasting Blood Glucose',
    shortName: 'Glucose',
    unit: 'mg/dL',
    normalLow: 70,
    normalHigh: 99,
    highThreshold: 126,
    guideline: 'ADA 2026 Standards of Care — Fasting plasma glucose ≥126 mg/dL indicates Diabetes Mellitus.',
    icon: '🩸',
    description: 'Measures blood sugar after an 8-hour overnight fast to screen for prediabetes and type 2 diabetes.',
  },
  {
    id: 'hba1c',
    name: 'HbA1c (Glycosylated Hemoglobin)',
    shortName: 'HbA1c',
    unit: '%',
    normalLow: 4.0,
    normalHigh: 5.6,
    highThreshold: 6.5,
    guideline: 'WHO / ADA Guidelines — HbA1c ≥6.5% confirms diabetes; 5.7–6.4% indicates impaired glucose tolerance.',
    icon: '🧬',
    description: 'Reflects average blood sugar levels over the past 2 to 3 months.',
  },
  {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    shortName: 'Cholesterol',
    unit: 'mg/dL',
    normalLow: 125,
    normalHigh: 200,
    highThreshold: 240,
    guideline: 'NCEP ATP III Guidelines — Desirable: <200 mg/dL; Borderline: 200–239 mg/dL; High: ≥240 mg/dL.',
    icon: '🫀',
    description: 'Measures overall lipid burden across LDL, HDL, and VLDL components.',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    shortName: 'Triglycerides',
    unit: 'mg/dL',
    normalLow: 50,
    normalHigh: 150,
    highThreshold: 200,
    guideline: 'AHA Clinical Reference — Normal: <150 mg/dL; Borderline high: 150–199 mg/dL; High: 200–499 mg/dL.',
    icon: '⚡',
    description: 'Type of fat found in blood stored in adipose tissue, linked to metabolic health.',
  },
  {
    id: 'creatinine',
    name: 'Serum Creatinine',
    shortName: 'Creatinine',
    unit: 'mg/dL',
    normalLow: 0.7,
    normalHigh: 1.2,
    highThreshold: 1.4,
    guideline: 'KDIGO Clinical Practice Guideline for Glomerular Diseases — Reference range: 0.7–1.2 mg/dL in adult males.',
    icon: '💧',
    description: 'Waste product cleared by the kidneys, essential for renal filtration evaluation.',
  },
];

export const BiomarkerTrendsView: React.FC<BiomarkerTrendsViewProps> = ({
  labResults,
  riskFlags,
  onOpenSummary,
  onOpenUpload,
}) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string>('glucose');
  const [timeframe, setTimeframe] = useState<'3m' | '6m' | '1y' | 'all'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeConfig = METRIC_CONFIGS.find((m) => m.id === selectedMetricId) || METRIC_CONFIGS[0];

  // Filter lab readings matching the selected metric
  const filteredData = useMemo(() => {
    const matched = labResults.filter((l) => {
      const name = l.testName.toLowerCase();
      if (activeConfig.id === 'glucose') return name.includes('glucose') || name.includes('sugar');
      if (activeConfig.id === 'hba1c') return name.includes('hba1c') || name.includes('hemoglobin');
      if (activeConfig.id === 'cholesterol') return name.includes('total cholesterol');
      if (activeConfig.id === 'triglycerides') return name.includes('triglyceride');
      if (activeConfig.id === 'creatinine') return name.includes('creatinine');
      return false;
    });

    // Sort chronologically ascending for line graph
    const sorted = [...matched].sort((a, b) => a.testDate.localeCompare(b.testDate));

    // Timeframe filtering
    if (timeframe === 'all' || sorted.length === 0) return sorted;
    const now = new Date();
    let monthsAgo = 12;
    if (timeframe === '3m') monthsAgo = 3;
    if (timeframe === '6m') monthsAgo = 6;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate())
      .toISOString()
      .split('T')[0];
    return sorted.filter((d) => d.testDate >= cutoff);
  }, [labResults, activeConfig, timeframe]);

  // Fallback points if user hasn't uploaded for this specific metric yet
  const displayPoints = useMemo(() => {
    if (filteredData.length > 0) {
      return filteredData.map((d) => ({
        date: d.testDate,
        value: d.value,
        lab: d.sourceLab || 'Hospital Diagnostics',
        flagged: riskFlags.some((f) => f.labResultId === d.labResultId),
      }));
    }

    // Default simulated points based on metric
    if (activeConfig.id === 'glucose') {
      return [
        { date: '2025-10-15', value: 104, lab: 'Fortis Hospital', flagged: false },
        { date: '2026-01-15', value: 112, lab: 'Fortis Hospital', flagged: false },
        { date: '2026-04-10', value: 122, lab: 'Max Healthcare', flagged: false },
        { date: '2026-08-20', value: 138, lab: 'Apollo Health City', flagged: true },
      ];
    }
    if (activeConfig.id === 'hba1c') {
      return [
        { date: '2025-10-15', value: 5.9, lab: 'Fortis Hospital', flagged: false },
        { date: '2026-04-10', value: 6.6, lab: 'Max Healthcare', flagged: false },
        { date: '2026-08-20', value: 7.1, lab: 'Apollo Health City', flagged: true },
      ];
    }
    if (activeConfig.id === 'cholesterol') {
      return [
        { date: '2025-10-15', value: 182, lab: 'Fortis Hospital', flagged: false },
        { date: '2026-04-10', value: 188, lab: 'Max Healthcare', flagged: false },
        { date: '2026-08-20', value: 194, lab: 'Apollo Health City', flagged: false },
      ];
    }
    if (activeConfig.id === 'triglycerides') {
      return [
        { date: '2025-10-15', value: 142, lab: 'Fortis Hospital', flagged: false },
        { date: '2026-08-20', value: 165, lab: 'Apollo Health City', flagged: true },
      ];
    }
    return [
      { date: '2026-01-15', value: 0.92, lab: 'Fortis Hospital', flagged: false },
      { date: '2026-08-20', value: 0.95, lab: 'Apollo Health City', flagged: false },
    ];
  }, [filteredData, activeConfig, riskFlags]);

  // Compute metrics statistics
  const latestValue = displayPoints[displayPoints.length - 1]?.value || 0;
  const firstValue = displayPoints[0]?.value || 0;
  const delta = latestValue - firstValue;
  const pctChange = firstValue ? ((delta / firstValue) * 100).toFixed(1) : '0';
  const isElevated = latestValue >= activeConfig.highThreshold;
  const isBorderline = latestValue > activeConfig.normalHigh && latestValue < activeConfig.highThreshold;

  // SVG dimensions
  const svgWidth = 760;
  const svgHeight = 280;
  const padLeft = 60;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 45;

  const minVal = Math.min(activeConfig.normalLow * 0.85, ...displayPoints.map((p) => p.value));
  const maxVal = Math.max(activeConfig.highThreshold * 1.15, ...displayPoints.map((p) => p.value));

  const scaleX = (index: number) => {
    if (displayPoints.length <= 1) return padLeft + (svgWidth - padLeft - padRight) / 2;
    return padLeft + (index / (displayPoints.length - 1)) * (svgWidth - padLeft - padRight);
  };

  const scaleY = (val: number) => {
    const range = maxVal - minVal || 1;
    return svgHeight - padBottom - ((val - minVal) / range) * (svgHeight - padTop - padBottom);
  };

  // Build SVG Path
  const pointsString = displayPoints.map((p, i) => `${scaleX(i)},${scaleY(p.value)}`).join(' ');

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="page-title">Longitudinal Biomarker Analytics</h2>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#4F46E5',
              }}
            >
              Multi-Hospital Consolidated
            </span>
          </div>
          <p className="page-subtitle">
            Track key clinical biomarkers across multiple hospitals with published ADA & WHO reference thresholds
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              soundFX.playChime();
              onOpenSummary();
            }}
          >
            <Sparkles size={15} style={{ display: 'inline', marginRight: '6px', color: '#7B73F6' }} />
            <span>AI Synthesis Report</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              soundFX.playChime();
              onOpenUpload();
            }}
          >
            <FileText size={15} style={{ display: 'inline', marginRight: '6px' }} />
            <span>Upload New Test</span>
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
        }}
      >
        {METRIC_CONFIGS.map((m) => {
          const isSelected = m.id === selectedMetricId;
          return (
            <button
              key={m.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedMetricId(m.id);
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '14px',
                border: isSelected ? '1.5px solid #4F46E5' : '1px solid #E5EAF3',
                backgroundColor: isSelected ? '#FFFFFF' : '#FAFBFD',
                color: isSelected ? '#1E293B' : '#64748B',
                boxShadow: isSelected ? '0 4px 16px rgba(79, 70, 229, 0.12)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '18px' }}>{m.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div>{m.shortName}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{m.unit}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Analytics Card */}
      <div className="ui-card" style={{ padding: '24px', marginBottom: '24px' }}>
        {/* Card Header & Timeframe Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {activeConfig.name}
              </h3>
              {isElevated ? (
                <span className="status-pill flag-high">
                  <AlertTriangle size={12} />
                  <span>Clinical Flag Active</span>
                </span>
              ) : isBorderline ? (
                <span className="status-pill flag-moderate">
                  <AlertTriangle size={12} />
                  <span>Borderline High</span>
                </span>
              ) : (
                <span className="status-pill normal">
                  <CheckCircle2 size={12} />
                  <span>Within Normal Range</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px', maxWidth: '600px' }}>
              {activeConfig.description}
            </p>
          </div>

          {/* Timeframe selector */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '3px',
              borderRadius: '10px',
            }}
          >
            {(['3m', '6m', '1y', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: timeframe === tf ? '#FFFFFF' : 'transparent',
                  color: timeframe === tf ? '#4F46E5' : '#64748B',
                  boxShadow: timeframe === tf ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tf === '3m' ? '3M' : tf === '6m' ? '6M' : tf === '1y' ? '1Y' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Delta Key Metrics Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#F8FAFF',
              border: '1px solid #E2E8F8',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>LATEST READING</div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: isElevated ? '#DC2626' : isBorderline ? '#D97706' : '#1E293B',
                marginTop: '4px',
              }}
            >
              {latestValue} <span style={{ fontSize: '13px', fontWeight: 600 }}>{activeConfig.unit}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
              Recorded on {displayPoints[displayPoints.length - 1]?.date}
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#F8FAFF',
              border: '1px solid #E2E8F8',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>LONGITUDINAL CHANGE</div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: delta > 0 ? '#DC2626' : delta < 0 ? '#10B981' : '#64748B',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {delta > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>{delta > 0 ? `+${pctChange}%` : `${pctChange}%`}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
              Across {displayPoints.length} hospital reports
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#F8FAFF',
              border: '1px solid #E2E8F8',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>NORMAL CLINICAL RANGE</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#10B981',
                marginTop: '6px',
              }}
            >
              {activeConfig.normalLow} – {activeConfig.normalHigh} {activeConfig.unit}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              High threshold: ≥{activeConfig.highThreshold} {activeConfig.unit}
            </div>
          </div>
        </div>

        {/* SVG Interactive Multi-Hospital Trend Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', minWidth: '640px', height: 'auto', display: 'block' }}
          >
            {/* Grid & Reference Zones */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Normal Range Shading */}
            <rect
              x={padLeft}
              y={scaleY(activeConfig.normalHigh)}
              width={svgWidth - padLeft - padRight}
              height={Math.max(0, scaleY(activeConfig.normalLow) - scaleY(activeConfig.normalHigh))}
              fill="rgba(16, 185, 129, 0.08)"
            />

            {/* Normal Zone Label */}
            <text
              x={svgWidth - padRight - 8}
              y={scaleY((activeConfig.normalLow + activeConfig.normalHigh) / 2) + 4}
              textAnchor="end"
              fill="#059669"
              fontSize="10.5"
              fontWeight="600"
            >
              Target Reference Zone ({activeConfig.normalLow}-{activeConfig.normalHigh})
            </text>

            {/* Clinical Alert Threshold Line */}
            <line
              x1={padLeft}
              y1={scaleY(activeConfig.highThreshold)}
              x2={svgWidth - padRight}
              y2={scaleY(activeConfig.highThreshold)}
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={padLeft + 8}
              y={scaleY(activeConfig.highThreshold) - 6}
              fill="#DC2626"
              fontSize="10"
              fontWeight="700"
            >
              ⚠ Clinical Threshold (≥{activeConfig.highThreshold} {activeConfig.unit})
            </text>

            {/* Area Fill */}
            {displayPoints.length > 1 && (
              <polygon
                points={`
                  ${scaleX(0)},${svgHeight - padBottom}
                  ${pointsString}
                  ${scaleX(displayPoints.length - 1)},${svgHeight - padBottom}
                `}
                fill="url(#areaGrad)"
              />
            )}

            {/* Connecting Stroke */}
            {displayPoints.length > 1 && (
              <polyline
                points={pointsString}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Plotted Points with Hospital Tags */}
            {displayPoints.map((p, idx) => {
              const cx = scaleX(idx);
              const cy = scaleY(p.value);
              const isHovered = hoveredIndex === idx;
              const pointColor = p.value >= activeConfig.highThreshold ? '#EF4444' : '#4F46E5';

              return (
                <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                  {/* Subtle vertical indicator line */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={svgHeight - padBottom}
                    stroke={isHovered ? '#6366F1' : '#E2E8F0'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeDasharray="2 2"
                  />

                  {/* Outer pulse circle on hover or high */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 11 : 7}
                    fill={pointColor}
                    fillOpacity={isHovered ? 0.25 : 0.15}
                  />

                  {/* Core Point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#FFFFFF"
                    stroke={pointColor}
                    strokeWidth={3}
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  />

                  {/* Value callout above point */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill={pointColor}
                    fontSize="11.5"
                    fontWeight="800"
                  >
                    {p.value}
                  </text>

                  {/* X Axis Date */}
                  <text
                    x={cx}
                    y={svgHeight - padBottom + 16}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {new Date(p.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                  </text>

                  {/* Facility Label */}
                  <text
                    x={cx}
                    y={svgHeight - padBottom + 28}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {p.lab.split(' ')[0]}
                  </text>

                  {/* Tooltip Card when hovered */}
                  {isHovered && (
                    <g transform={`translate(${Math.min(cx - 70, svgWidth - 170)}, ${Math.max(cy - 60, 10)})`}>
                      <rect
                        width="150"
                        height="48"
                        rx="8"
                        fill="#0F172A"
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.2))"
                      />
                      <text x="10" y="18" fill="#FFFFFF" fontSize="11" fontWeight="700">
                        {p.value} {activeConfig.unit} ({p.lab})
                      </text>
                      <text x="10" y="34" fill="#94A3B8" fontSize="10">
                        {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Clinical Guideline Citation Footer */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#475569',
          }}
        >
          <ShieldCheck size={18} color="#4F46E5" style={{ flexShrink: 0 }} />
          <div>
            <strong>Published Guideline Standard:</strong> {activeConfig.guideline}
          </div>
        </div>
      </div>
    </div>
  );
};
