import React, { useState } from 'react';
import { X, UploadCloud, FileText, Pill, Syringe, Check, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { DocumentType, HealthDocument, LabResult, Prescription, Vaccination } from '../types';
import confetti from 'canvas-confetti';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (
    doc: HealthDocument,
    payload: LabResult | Prescription | Vaccination
  ) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSaveRecord }) => {
  const [selectedType, setSelectedType] = useState<DocumentType>('lab_report');
  const [scanStep, setScanStep] = useState<'pick' | 'scanning' | 'review'>('pick');
  const [confidence, setConfidence] = useState(97.8);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Editable form state for Lab
  const [labName, setLabName] = useState('Fasting Blood Glucose');
  const [labValue, setLabValue] = useState('142');
  const [labUnit, setLabUnit] = useState('mg/dL');
  const [labFacility, setLabFacility] = useState('Max Healthcare Labs');
  const [labDate, setLabDate] = useState('2026-09-10');

  // Form state for Prescription
  const [rxDrug, setRxDrug] = useState('Atorvastatin');
  const [rxDose, setRxDose] = useState('20mg');
  const [rxFreq, setRxFreq] = useState('Once daily at bedtime');
  const [rxDoctor, setRxDoctor] = useState('Dr. Arvind Rao, MD (Cardiology)');
  const [rxHospital, setRxHospital] = useState('Fortis Hospital');

  // Form state for Vaccine
  const [vacName, setVacName] = useState('Hepatitis B Recombinant');
  const [vacDose, setVacDose] = useState('3');
  const [vacFacility, setVacFacility] = useState('Apollo Immunization Center');

  if (!isOpen) return null;

  const handleSelectPreset = (type: DocumentType) => {
    setSelectedType(type);
    if (type === 'lab_report') {
      setLabName('Fasting Blood Glucose');
      setLabValue('142');
      setLabUnit('mg/dL');
      setLabFacility('Max Healthcare Labs');
      setLabDate('2026-09-10');
      setConfidence(97.8);
    } else if (type === 'prescription') {
      setRxDrug('Atorvastatin Calcium');
      setRxDose('20mg');
      setRxFreq('Once nightly');
      setRxDoctor('Dr. Arvind Rao, MD');
      setRxHospital('Fortis Hospital');
      setConfidence(88.4);
    } else {
      setVacName('Tetanus Toxoid (TT)');
      setVacDose('1');
      setVacFacility('Manipal Hospital');
      setConfidence(99.2);
    }
  };

  const handleRunOcr = () => {
    setScanStep('scanning');

    setTimeout(() => {
      setScanStep('review');
    }, 1600);
  };

  const handleConfirmSave = () => {
    const docId = `doc_uploaded_${Date.now()}`;
    const newDoc: HealthDocument = {
      documentId: docId,
      userId: 'usr_rahul_992',
      type: selectedType,
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      uploadedAt: new Date().toISOString(),
      ocrStatus: confidence >= 90 ? 'success' : 'low_confidence',
      confidenceScore: confidence,
      rawOcrText: `DEMO OCR PARSED TEXT FOR ${selectedType.toUpperCase()}\nExtracted at ${new Date().toLocaleString()}`,
    };

    let payload: LabResult | Prescription | Vaccination;

    if (selectedType === 'lab_report') {
      const numVal = parseFloat(labValue) || 120;
      payload = {
        labResultId: `lab_new_${Date.now()}`,
        documentId: docId,
        userId: 'usr_rahul_992',
        testName: labName,
        value: numVal,
        unit: labUnit,
        referenceRangeLow: 70,
        referenceRangeHigh: 99,
        testDate: labDate,
        sourceLab: labFacility,
        manuallyCorrected: isManualEdit,
        statusFlag: numVal >= 126 ? 'high' : numVal >= 100 ? 'moderate' : 'normal',
      };
    } else if (selectedType === 'prescription') {
      payload = {
        prescriptionId: `rx_new_${Date.now()}`,
        documentId: docId,
        userId: 'usr_rahul_992',
        drugName: rxDrug,
        dosage: rxDose,
        frequency: rxFreq,
        prescribedDate: new Date().toISOString().split('T')[0],
        prescribingDoctor: rxDoctor,
        sourceHospital: rxHospital,
        manuallyCorrected: isManualEdit,
      };
    } else {
      payload = {
        vaccinationId: `vac_new_${Date.now()}`,
        documentId: docId,
        userId: 'usr_rahul_992',
        vaccineName: vacName,
        doseNumber: parseInt(vacDose, 10) || 1,
        dateAdministered: new Date().toISOString().split('T')[0],
        facility: vacFacility,
      };
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onSaveRecord(newDoc, payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Upload & Digitizing Medical Document</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Optical Character Recognition (OCR) with Structured Medical Extraction
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {scanStep === 'pick' && (
            <>
              {/* Type selection */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
                  1. Select Document Category:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedType === 'lab_report' ? '2px solid #F5A623' : '1px solid #E2E8F0',
                      background: selectedType === 'lab_report' ? '#FFF9F0' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: selectedType === 'lab_report' ? '#B45309' : '#4B5563',
                    }}
                    onClick={() => handleSelectPreset('lab_report')}
                  >
                    <FileText size={18} color="#D97706" />
                    <span>Lab Report</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedType === 'prescription' ? '2px solid #7B73F6' : '1px solid #E2E8F0',
                      background: selectedType === 'prescription' ? '#F4F2FF' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: selectedType === 'prescription' ? '#6D28D9' : '#4B5563',
                    }}
                    onClick={() => handleSelectPreset('prescription')}
                  >
                    <Pill size={18} color="#7C3AED" />
                    <span>Prescription</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedType === 'vaccination' ? '2px solid #10B981' : '1px solid #E2E8F0',
                      background: selectedType === 'vaccination' ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: selectedType === 'vaccination' ? '#047857' : '#4B5563',
                    }}
                    onClick={() => handleSelectPreset('vaccination')}
                  >
                    <Syringe size={18} color="#059669" />
                    <span>Vaccination</span>
                  </button>
                </div>
              </div>

              {/* Sample Scans Presets */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
                  2. Choose a Sample Scanned Document (or Upload Image):
                </label>
                <div className="preset-grid">
                  <div
                    className={`preset-card ${selectedType === 'lab_report' ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset('lab_report')}
                  >
                    <div className="preset-type">Apollo Labs Scan</div>
                    <div className="preset-title">Fasting Blood Sugar</div>
                    <div className="preset-desc">142 mg/dL · Elevated · OCR 97.8%</div>
                  </div>

                  <div
                    className={`preset-card ${selectedType === 'prescription' ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset('prescription')}
                  >
                    <div className="preset-type">Fortis Rx Scan</div>
                    <div className="preset-title">Atorvastatin 20mg</div>
                    <div className="preset-desc">Cholesterol Rx · OCR 88.4%</div>
                  </div>

                  <div
                    className={`preset-card ${selectedType === 'vaccination' ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset('vaccination')}
                  >
                    <div className="preset-type">Cowin Certificate</div>
                    <div className="preset-title">Tetanus Toxoid Booster</div>
                    <div className="preset-desc">Dose #1 · OCR 99.2%</div>
                  </div>
                </div>
              </div>

              {/* Drop area */}
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                }}
                onClick={handleRunOcr}
              >
                <UploadCloud size={38} color="#6366F1" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Click to Simulate OCR Scan & Field Extraction
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Supports JPEG, PNG, or PDF scans under India DPDP Act client-side protection
                </div>
              </div>
            </>
          )}

          {scanStep === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
              <div className="ocr-scan-container">
                <div className="ocr-laser" />
                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                  <Sparkles size={28} color="#38BDF8" style={{ margin: '0 auto 10px', animation: 'spin 3s linear infinite' }} />
                  <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '14px' }}>
                    Google ML Kit / OCR Text Extraction Running...
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Segmenting bounding boxes and parsing medical entities
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanStep === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Confidence badge banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: confidence >= 90 ? '#ECFDF5' : '#FFFBEB',
                  border: confidence >= 90 ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {confidence >= 90 ? (
                    <Check size={18} color="#059669" />
                  ) : (
                    <AlertTriangle size={18} color="#D97706" />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: confidence >= 90 ? '#065F46' : '#92400E' }}>
                    {confidence >= 90
                      ? `High OCR Extraction Confidence (${confidence}%)`
                      : `Medium Confidence (${confidence}%) — Manual Verification Advised`}
                  </span>
                </div>

                <button
                  type="button"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsManualEdit(!isManualEdit)}
                >
                  {isManualEdit ? 'Locked Fields' : 'Enable Manual Edit'}
                </button>
              </div>

              {/* Extracted Fields Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Structured Extracted Fields (schema.md)
                </div>

                {selectedType === 'lab_report' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Test Name</label>
                      <input
                        type="text"
                        value={labName}
                        onChange={(e) => { setLabName(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Value</label>
                      <input
                        type="number"
                        value={labValue}
                        onChange={(e) => { setLabValue(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Unit</label>
                      <input
                        type="text"
                        value={labUnit}
                        onChange={(e) => { setLabUnit(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'prescription' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Medication Name</label>
                      <input
                        type="text"
                        value={rxDrug}
                        onChange={(e) => { setRxDrug(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Dosage & Frequency</label>
                      <input
                        type="text"
                        value={`${rxDose} (${rxFreq})`}
                        onChange={(e) => { setRxDose(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'vaccination' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Vaccine Name</label>
                      <input
                        type="text"
                        value={vacName}
                        onChange={(e) => { setVacName(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Dose Number</label>
                      <input
                        type="number"
                        value={vacDose}
                        onChange={(e) => { setVacDose(e.target.value); setIsManualEdit(true); }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {isManualEdit ? (
                    <span style={{ color: '#4F46E5', fontWeight: 600 }}>
                      ℹ️ Field manually edited — `manuallyCorrected: true` will be flagged on timeline.
                    </span>
                  ) : (
                    'Direct OCR output pre-filled from document image.'
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {scanStep === 'pick' && (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleRunOcr}>
                Scan & Extract Fields
              </button>
            </>
          )}

          {scanStep === 'review' && (
            <>
              <button className="btn-secondary" onClick={() => setScanStep('pick')}>
                <RefreshCw size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Rescan
              </button>
              <button className="btn-primary" onClick={handleConfirmSave}>
                Save to Health Timeline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
