import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Pill,
  Syringe,
  Check,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Key,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentType, HealthDocument, LabResult, Prescription, Vaccination } from '../types';
import confetti from 'canvas-confetti';
import { extractLabReportWithGemini, getGeminiApiKey, setGeminiApiKey } from '../services/geminiOcr';
import { showToast } from './Toast';

interface UploadModalProps {
  isOpen: boolean;
  initialDocumentType?: DocumentType;
  onClose: () => void;
  onSaveRecord: (
    doc: HealthDocument,
    payload: LabResult | Prescription | Vaccination
  ) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  initialDocumentType,
  onClose,
  onSaveRecord,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>(initialDocumentType || 'lab_report');
  const [scanStep, setScanStep] = useState<'pick' | 'scanning' | 'review'>('pick');
  const [confidence, setConfidence] = useState(97.8);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Real upload & Gemini OCR states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrLowConfidenceReason, setOcrLowConfidenceReason] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [refRangeLow, setRefRangeLow] = useState<number | null>(70);
  const [refRangeHigh, setRefRangeHigh] = useState<number | null>(99);
  const [refRangeStr, setRefRangeStr] = useState('70 - 99 mg/dL');

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

  function handleSelectPreset(type: DocumentType) {
    setSelectedType(type);
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    setOcrError(null);
    setOcrLowConfidenceReason(null);
    if (type === 'lab_report') {
      setLabName('Fasting Blood Glucose');
      setLabValue('142');
      setLabUnit('mg/dL');
      setLabFacility('Max Healthcare Labs');
      setLabDate('2026-09-10');
      setConfidence(97.8);
      setRefRangeLow(70);
      setRefRangeHigh(99);
      setRefRangeStr('70 - 99 mg/dL');
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
  }

  useEffect(() => {
    if (initialDocumentType) {
      handleSelectPreset(initialDocumentType);
    }
    setScanStep('pick');
    setGeminiKey(getGeminiApiKey());
  }, [isOpen, initialDocumentType]);

  if (!isOpen) return null;

  // Real file selection & processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setUploadedFile(file);
    const preview = URL.createObjectURL(file);
    setUploadedPreviewUrl(preview);
    setOcrError(null);

    if (selectedType === 'lab_report') {
      const activeKey = getGeminiApiKey();
      if (!activeKey) {
        setShowKeyInput(true);
        setOcrError('Gemini API Key required for real OCR. Please paste your key below.');
        showToast('error', 'API Key Needed', 'Please provide your Google Gemini API key to run Vision OCR.');
        return;
      }

      setScanStep('scanning');
      try {
        const data = await extractLabReportWithGemini(file);
        setLabName(data.testName);
        setLabValue(String(data.value));
        setLabUnit(data.unit);
        setLabFacility(data.facility);
        setLabDate(data.date);
        setConfidence(data.confidence);
        setRefRangeLow(data.referenceRangeLow ?? 70);
        setRefRangeHigh(data.referenceRangeHigh ?? 99);
        setRefRangeStr(data.referenceRange || `${data.referenceRangeLow ?? 70} - ${data.referenceRangeHigh ?? 99} ${data.unit}`);
        setOcrLowConfidenceReason(data.lowConfidenceReason || null);

        // Auto-enable manual edit if confidence < 90
        if (data.confidence < 90) {
          setIsManualEdit(true);
        } else {
          setIsManualEdit(false);
        }

        setScanStep('review');
        showToast('success', 'Lab Report Extracted', `Parsed ${data.testName} (${data.confidence.toFixed(1)}% confidence) via Gemini 1.5 Flash`);
      } catch (err: any) {
        console.error('Gemini OCR Error:', err);
        setOcrError(err.message || 'Failed to extract lab data with Gemini.');
        setScanStep('pick');
        showToast('error', 'OCR Error', err.message || 'Gemini could not parse this document.');
      }
    } else {
      // Step 2 explicitly specifies: lab reports only; prescriptions/vaccines remain simulated/preset
      handleRunOcr();
    }
  };

  const handleSaveApiKey = () => {
    if (!tempKeyInput.trim()) return;
    setGeminiApiKey(tempKeyInput.trim());
    setGeminiKey(tempKeyInput.trim());
    setShowKeyInput(false);
    setOcrError(null);
    showToast('success', 'Gemini API Key Saved', 'Key configured for Gemini 1.5 Flash Vision OCR');
    if (uploadedFile) {
      processUploadedFile(uploadedFile);
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
      imageUrl:
        uploadedPreviewUrl ||
        (selectedType === 'lab_report'
          ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'),
      uploadedAt: new Date().toISOString(),
      ocrStatus: confidence >= 90 ? 'success' : 'low_confidence',
      confidenceScore: confidence,
      rawOcrText:
        selectedType === 'lab_report' && uploadedFile
          ? `REAL GEMINI 1.5 FLASH OCR REPORT\nTest: ${labName}\nValue: ${labValue} ${labUnit}\nRef: ${refRangeStr}\nLab: ${labFacility}\nDate: ${labDate}\nConfidence: ${confidence.toFixed(1)}%`
          : `PARSED TEXT FOR ${selectedType.toUpperCase()}\nExtracted at ${new Date().toLocaleString()}`,
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
        referenceRangeLow: refRangeLow ?? 70,
        referenceRangeHigh: refRangeHigh ?? 99,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="modal-title">Upload & Digitizing Medical Document</div>
              {selectedType === 'lab_report' && (
                geminiKey ? (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#ECFDF5',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    <Sparkles size={11} /> Gemini 1.5 Flash OCR
                  </span>
                ) : (
                  <button
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#FFFBEB',
                      color: '#D97706',
                      border: '1px solid #FDE68A',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Key size={11} /> Enter Gemini Key
                  </button>
                )
              )}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Optical Character Recognition (OCR) with Structured Medical Entity Extraction
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Collapsible Gemini API Key Input */}
          {showKeyInput && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Key size={16} color="#6366F1" />
              <input
                type="password"
                placeholder="Paste Gemini API Key (starts with AIza...)"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveApiKey}
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Save Key
              </button>
            </div>
          )}

          {ocrError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '12.5px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} color="#DC2626" />
              <span>{ocrError}</span>
            </div>
          )}

          {scanStep === 'pick' && (
            <>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

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

              {/* Real File Drop Area */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
                  2. Upload Image File (Real OCR with Gemini 1.5 Flash Vision):
                </label>
                <div
                  style={{
                    border: '2px dashed #6366F1',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processUploadedFile(file);
                  }}
                >
                  <UploadCloud size={38} color="#6366F1" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedType === 'lab_report'
                      ? 'Upload Real Lab Report (Live Gemini Vision OCR)'
                      : 'Upload Scanned Document'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Drag & drop or click to upload PNG, JPG, or WEBP image
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Browse Device Files
                  </div>
                </div>
              </div>

              {/* Sample Scans Presets */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  Or Choose a Sample Demo Scanned Document:
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
            </>
          )}

          {scanStep === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
              <div className="ocr-scan-container" style={{ position: 'relative', overflow: 'hidden' }}>
                {uploadedPreviewUrl && (
                  <img
                    src={uploadedPreviewUrl}
                    alt="Scan Target"
                    style={{
                      width: '100%',
                      maxHeight: '180px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      opacity: 0.35,
                      filter: 'contrast(1.1)',
                    }}
                  />
                )}
                <div className="ocr-laser" />
                <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: uploadedPreviewUrl ? '8px' : '0' }}>
                  <Sparkles size={28} color="#38BDF8" style={{ margin: '0 auto 10px', animation: 'spin 3s linear infinite' }} />
                  <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '14px' }}>
                    {selectedType === 'lab_report' && uploadedFile
                      ? 'Gemini 1.5 Flash Vision OCR Extracting Lab Entities...'
                      : 'Google ML Kit / OCR Text Extraction Running...'}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Segmenting medical entities: test name, extracted value, unit, reference range & date
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
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: confidence >= 90 ? '#065F46' : '#92400E' }}>
                      {confidence >= 90
                        ? `High OCR Extraction Confidence (${confidence.toFixed(1)}%)`
                        : `Medium / Low Confidence (${confidence.toFixed(1)}%) — Manual Verification Advised`}
                    </span>
                    {ocrLowConfidenceReason && (
                      <div style={{ fontSize: '11.5px', color: '#B45309', marginTop: '2px' }}>
                        Note: {ocrLowConfidenceReason}
                      </div>
                    )}
                  </div>
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
                  {isManualEdit ? 'Manual Edit Active' : 'Enable Manual Edit'}
                </button>
              </div>

              {/* Extracted Fields Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Structured Extracted Fields (schema.md)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Recategorize:</span>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 600, color: '#1E293B', background: '#fff' }}
                    >
                      <option value="lab_report">Lab Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="vaccination">Vaccination</option>
                    </select>
                  </div>
                </div>

                {selectedType === 'lab_report' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {uploadedPreviewUrl && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <img
                          src={uploadedPreviewUrl}
                          alt="Scanned Report"
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ImageIcon size={14} color="#4F46E5" />
                            <span>Attached Lab Scan</span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {labFacility} · Analyzed by Gemini 1.5 Flash Vision
                          </div>
                        </div>
                      </div>
                    )}

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
                          step="any"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Reference Range</label>
                        <input
                          type="text"
                          value={refRangeStr}
                          onChange={(e) => { setRefRangeStr(e.target.value); setIsManualEdit(true); }}
                          placeholder="e.g. 70 - 99 mg/dL"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Source Lab / Hospital</label>
                        <input
                          type="text"
                          value={labFacility}
                          onChange={(e) => { setLabFacility(e.target.value); setIsManualEdit(true); }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Test Date</label>
                        <input
                          type="date"
                          value={labDate}
                          onChange={(e) => { setLabDate(e.target.value); setIsManualEdit(true); }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>
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
