import React from 'react';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
  lab: string;
}

const DEFAULT_GLUCOSE_DATA: DataPoint[] = [
  { date: '10 Jun 2026', value: 108, lab: 'Apollo' },
  { date: '20 Jul 2026', value: 124, lab: 'Max' },
  { date: '18 Aug 2026', value: 142, lab: 'Dr. Lal PathLabs' }
];

export interface TrendChartProps {
  title?: string;
  unit?: string;
  normalRange?: [number, number];
  clinicalThreshold?: number;
  data?: DataPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  title = 'Fasting Blood Glucose',
  unit = 'mg/dL',
  normalRange = [70, 99],
  clinicalThreshold = 126,
  data = DEFAULT_GLUCOSE_DATA
}) => {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values, normalRange[0]) - 10;
  const maxVal = Math.max(...values, normalRange[1], clinicalThreshold) + 15;
  const rangeSpan = maxVal - minVal || 1;

  // Chart coordinate mapping (width: 500, height: 220)
  const chartWidth = 460;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (idx: number) => {
    if (data.length === 1) return chartWidth / 2;
    return paddingX + (idx * (chartWidth - paddingX * 2)) / (data.length - 1);
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / rangeSpan;
    return chartHeight - paddingY - norm * (chartHeight - paddingY * 2);
  };

  const points = data.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.value),
    value: d.value,
    date: d.date,
    lab: d.lab
  }));

  const pathD = points.length > 0 
    ? points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')
    : '';

  const thresholdY = getY(clinicalThreshold);
  const normalLowY = getY(normalRange[0]);
  const normalHighY = getY(normalRange[1]);

  const isIncreasing = values.length >= 2 && values[values.length - 1] > values[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-clinical-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-display font-bold text-base text-slate-900">{title} Trend</h4>
            <span className="text-xs text-slate-500 font-mono">({unit})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Normal reference: {normalRange[0]}–{normalRange[1]} {unit} • High threshold: ≥{clinicalThreshold} {unit}
          </p>
        </div>

        {isIncreasing && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
            <TrendingUp size={15} className="text-amber-600" />
            <span>Increasing (+{Math.round(((values[values.length - 1] - values[0]) / values[0]) * 100)}%)</span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible select-none"
        >
          {/* Shaded Normal Range Band */}
          <rect
            x={paddingX - 10}
            y={normalHighY}
            width={chartWidth - paddingX * 2 + 20}
            height={normalLowY - normalHighY}
            fill="#ECFDF5"
            opacity="0.75"
            rx="4"
          />

          {/* Clinical Alert Threshold Line */}
          <line
            x1={paddingX - 10}
            y1={thresholdY}
            x2={chartWidth - paddingX + 10}
            y2={thresholdY}
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={chartWidth - paddingX + 12}
            y={thresholdY + 4}
            fill="#E11D48"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            Threshold {clinicalThreshold}
          </text>

          {/* Trend Polyline */}
          <path
            d={pathD}
            fill="none"
            stroke="#0F2D3C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points with tooltips */}
          {points.map((pt, idx) => {
            const isHigh = pt.value >= clinicalThreshold;
            return (
              <g key={idx} className="cursor-pointer group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={isHigh ? '#E11D48' : '#0F2D3C'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-md transition-transform group-hover:scale-125"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="12"
                  fill={isHigh ? '#E11D48' : '#0F2D3C'}
                  opacity="0.15"
                />

                {/* Value Label above node */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill={isHigh ? '#BE123C' : '#0F2D3C'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {pt.value}
                </text>

                {/* Date Label below baseline */}
                <text
                  x={pt.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanatory Clinical Note */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-2.5 text-xs text-slate-600">
        <Info size={16} className="text-brand-900 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Observation:</strong> Your fasting glucose has increased across the last 3 recorded tests ({values.join(' → ')} mg/dL). This graph cites standard clinical thresholds and does not make a diagnosis. Consider discussing these results with a doctor.
        </p>
      </div>
    </div>
  );
};

export default TrendChart;
