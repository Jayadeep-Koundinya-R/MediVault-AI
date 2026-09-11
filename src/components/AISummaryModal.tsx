import React from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, FileDown, ShieldCheck, Heart } from 'lucide-react';
import { AISummary, RiskFlag } from '../types';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AISummary;
  riskFlags: RiskFlag[];
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  riskFlags,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7B73F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div className="modal-title">AI Consolidated Clinical Health Summary</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Multi-hospital longitudinal synthesis · Generated {new Date(summary.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Plain-Language Synthesis Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: '#F8FAFF',
              border: '1px solid #E2E8F8',
              lineHeight: 1.6,
              fontSize: '13.5px',
              color: '#1E293B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4338CA', fontWeight: 700, marginBottom: '10px', fontSize: '13px' }}>
              <Heart size={16} />
              <span>Consolidated Record Overview</span>
            </div>
            {summary.summaryText}
          </div>

          {/* Key Multi-Report Trends Section (PRD Success Criterion) */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#DC2626" />
              <span>Identified Longitudinal Biomarker Trends</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.trendNotes.map((note, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: index === 0 ? '#FEF2F2' : '#FFFFFF',
                    border: index === 0 ? '1px solid #FECACA' : '1px solid #E5EAF3',
                    fontSize: '13px',
                    color: index === 0 ? '#991B1B' : 'var(--text-primary)',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#DC2626' : '#6366F1',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Risk Flags Cited */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#D97706" />
              <span>Active Reference Range Risk Flags ({riskFlags.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {riskFlags.map((flag) => (
                <div
                  key={flag.flagId}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: flag.severity === 'high' ? '#FEF2F2' : '#FFFBEB',
                    border: flag.severity === 'high' ? '1px solid #FECACA' : '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: flag.severity === 'high' ? '#B91C1C' : '#92400E' }}>
                      {flag.thresholdDescription}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>
                      Citing published clinical guideline: {flag.ruleTriggered.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: flag.severity === 'high' ? '#EF4444' : '#F59E0B',
                      color: '#FFFFFF',
                    }}
                  >
                    {flag.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '12px',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0 }} />
            <div>
              <strong>Clinician Consultation Notice:</strong> This AI synthesis reflects consolidated data extracted from patient-provided documents. Flags cite established medical guidelines but do not replace certified medical consultation or diagnosis.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => {
              window.print();
            }}
          >
            <FileDown size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Export Patient PDF
          </button>
          <button className="btn-primary" onClick={onClose}>
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
