import React from 'react';
import { X, ShieldCheck, Lock, Download, Check, AlertCircle } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentChange?: (granted: boolean) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="modal-title">Health Data Privacy & Consent</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                India Digital Personal Data Protection (DPDP) Act, 2023 Compliance
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Check size={20} color="#059669" />
            <div style={{ fontSize: '13px', color: '#065F46', fontWeight: 600 }}>
              Consent Status: <strong>Active & Verified</strong>. Your medical records are encrypted under 256-bit AES protection.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Lock size={18} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Purpose of Processing:</strong> Health records (prescriptions, lab tests, vaccination cards) are processed strictly to build your longitudinal personal health timeline, calculate clinical guideline threshold flags, and assist your doctor visits.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>No Third-Party Sharing:</strong> Your sensitive personal data is never sold, shared with insurers, or used for commercial ad targeting.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Right to Withdraw & Erasure:</strong> Under Section 6 of the DPDP Act, you hold the unfettered right to withdraw consent and request immediate purging of all uploaded scans and OCR text buffers.
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Data Principal: <strong>Rahul Sharma</strong> (ID: usr_rahul_992)
            </span>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => {
                const jsonBlob = new Blob([JSON.stringify({ patient: 'Rahul Sharma', exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(jsonBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'medivault_patient_export.json';
                a.click();
              }}
            >
              <Download size={13} />
              <span>Export Raw Data JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
