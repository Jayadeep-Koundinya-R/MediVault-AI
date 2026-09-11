import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { TimelineItem } from '../types';

interface RecordDetailModalProps {
  item: TimelineItem | null;
  onClose: () => void;
  onUpdateValue: (id: string, newValue: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  item,
  onClose,
  onUpdateValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item?.valueDisplay || '');

  if (!item) return null;

  const handleSaveEdit = () => {
    onUpdateValue(item.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="modal-title">{item.title}</span>
              {item.isFlagged && (
                <span className="status-pill flag-high">
                  <ShieldAlert size={12} />
                  <span>Clinical Risk Flag</span>
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {item.subtitle} · Recorded on {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body - 2 Columns (Document Metadata & Scanned Document OCR Preview) */}
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left: Structured Data & Flag Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Risk Flag Banner if applicable */}
            {item.isFlagged && item.flagRule && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B91C1C', fontWeight: 700, fontSize: '13px' }}>
                  <AlertTriangle size={16} />
                  <span>Clinical Threshold Triggered</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#7F1D1D', lineHeight: 1.4 }}>
                  <strong>Rule:</strong> {item.flagRule}
                </div>
                <div style={{ fontSize: '11px', color: '#991B1B', fontStyle: 'italic', marginTop: '4px' }}>
                  * Notice: Cites official clinical reference criteria. This does not constitute an automated diagnosis. Consult your healthcare provider.
                </div>
              </div>
            )}

            {/* Structured Fields */}
            <div style={{ background: '#FAFBFD', border: '1px solid #E5EAF3', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Extracted Document Attributes (schema.md)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Facility / Hospital</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{item.sourceFacility}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Document ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6366F1', marginTop: '2px' }}>{item.documentId}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Extracted Reading / Dosage</div>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #6366F1', fontSize: '13px', width: '130px' }}
                      />
                      <button onClick={handleSaveEdit} style={{ background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}>
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: item.isFlagged ? '#DC2626' : 'var(--text-primary)' }}>
                        {item.valueDisplay}
                      </span>
                      <button
                        onClick={() => { setIsEditing(true); setEditValue(item.valueDisplay); }}
                        style={{ fontSize: '11px', color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Reference Range</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{item.referenceRange || 'Standard Adult'}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>OCR Confidence</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    <span style={{ fontWeight: 700, color: '#065F46' }}>{item.ocrConfidence}%</span>
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Manual Correction</div>
                  <div style={{ fontWeight: 600, color: item.manuallyCorrected ? '#4F46E5' : 'var(--text-muted)', marginTop: '2px' }}>
                    {item.manuallyCorrected ? 'Yes (Verified by User)' : 'No (Raw OCR Confirmed)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw OCR Text Preview */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Raw OCR Extracted Text Buffer
              </div>
              <pre
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  minHeight: '100px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  lineHeight: 1.4,
                }}
              >
                {item.document.rawOcrText || `[OCR Text Segment]\nVerified at: ${item.date}\nConfidence: ${item.ocrConfidence}%\nPatient: Rahul Sharma\nFacility: ${item.sourceFacility}`}
              </pre>
            </div>
          </div>

          {/* Right: Original Document Scan Reference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ImageIcon size={14} />
                <span>Original Hospital Scan</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>DPDP Encrypted</span>
            </div>

            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F1F5F9',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {item.document.imageUrl ? (
                <img
                  src={item.document.imageUrl}
                  alt={`Scan for ${item.title}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748B' }}>
                  <FileText size={40} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                  <div>Scanned Document Preview</div>
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Scanned on {new Date(item.date).toLocaleDateString()}</span>
                <span style={{ color: '#38BDF8' }}>{item.ocrConfidence}% Confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
