import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  FlaskConical, 
  Syringe, 
  Camera, 
  UploadCloud, 
  Edit3, 
  Link2, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  Plus, 
  Eye, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecordType, LabResult, Prescription, Vaccination } from '../types';
import { ocrService, OCRProcessingResult } from '../services/ocrService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CameraModal from '../components/camera/CameraModal';
import DocumentViewerModal from '../components/viewer/DocumentViewerModal';

type Step = 'type' | 'source' | 'processing' | 'review';

export const UploadFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addRecord, ocrMode, setOcrMode, addToast } = useApp();

  const initialType = (searchParams.get('type') as RecordType) || 'prescription';
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<RecordType>(initialType);
  const [previewImage, setPreviewImage] = useState<string>('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80');
  
  // OCR Progress State
  const [ocrStage, setOcrStage] = useState<number>(0);
  const [ocrStageText, setOcrStageText] = useState<string>('Preparing document...');
  const [ocrResult, setOcrResult] = useState<OCRProcessingResult | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);

  // Tracking user manual edits
  const [manuallyModified, setManuallyModified] = useState<Record<string, boolean>>({});

  // Editable form state for Review step
  const [formData, setFormData] = useState<{
    sourceName: string;
    date: string;
    doctorName: string;
    medications: Array<{
      drugName: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions?: string;
    }>;
    labTests: Array<{
      testName: string;
      value: number | string;
      unit: string;
      referenceRangeText: string;
      referenceRangeLow: number;
      referenceRangeHigh: number;
      status: 'normal' | 'high' | 'low';
    }>;
    vaccineName: string;
    doseNumber: number;
    nextDueDate: string;
    batchNumber: string;
    facility: string;
  }>({
    sourceName: '',
    date: new Date().toISOString().split('T')[0],
    doctorName: '',
    medications: [],
    labTests: [],
    vaccineName: '',
    doseNumber: 1,
    nextDueDate: '',
    batchNumber: '',
    facility: ''
  });

  const markFieldEdited = (fieldKey: string) => {
    setManuallyModified(prev => ({ ...prev, [fieldKey]: true }));
  };

  const handleStartOCR = async (imgData: string) => {
    setPreviewImage(imgData);
    setStep('processing');
    setOcrStage(0);
    setOcrStageText('Starting document upload...');

    try {
      const res = await ocrService.processDocument(selectedType, imgData, (stage, stageName) => {
        setOcrStage(stage);
        setOcrStageText(stageName);
      });

      setOcrResult(res);

      // Populate form data based on result
      if (res.confidence !== 'failed') {
        const docDate = new Date().toISOString().split('T')[0];
        if (res.detectedType === 'prescription' && res.extractedPrescription) {
          const rx = res.extractedPrescription;
          setFormData(prev => ({
            ...prev,
            sourceName: rx.sourceHospital || res.sourceName || 'Apex Healthcare',
            doctorName: rx.prescribingDoctor || 'Dr. Arvind Swaminathan',
            date: rx.prescribedDate || docDate,
            medications: [
              {
                drugName: rx.drugName || 'Metformin',
                dosage: rx.dosage || '500 mg',
                frequency: rx.frequency || 'Twice daily',
                instructions: rx.instructions || 'Take with water after meals'
              }
            ]
          }));
        } else if (res.detectedType === 'lab_report' && res.extractedLabResults) {
          setFormData(prev => ({
            ...prev,
            sourceName: res.sourceName || 'Dr. Lal PathLabs',
            date: docDate,
            labTests: res.extractedLabResults!.map(t => ({
              testName: t.testName || 'Test',
              value: t.value ?? 100,
              unit: t.unit || 'mg/dL',
              referenceRangeText: t.referenceRangeText || '70–99 mg/dL',
              referenceRangeLow: t.referenceRangeLow ?? 70,
              referenceRangeHigh: t.referenceRangeHigh ?? 99,
              status: t.status || 'normal'
            }))
          }));
        } else if (res.detectedType === 'vaccination' && res.extractedVaccination) {
          const vax = res.extractedVaccination;
          setFormData(prev => ({
            ...prev,
            sourceName: vax.facility || res.sourceName || 'Apollo Clinic',
            facility: vax.facility || 'Apollo Clinic',
            date: vax.dateAdministered || docDate,
            vaccineName: vax.vaccineName || 'Influenza (Quadrivalent)',
            doseNumber: vax.doseNumber || 1,
            nextDueDate: vax.nextDueDate || '2026-08-18'
          }));
        }
      }

      setStep('review');
    } catch (err) {
      addToast('OCR processing failed', 'error');
      setStep('review');
    }
  };

  const handleManualEntry = () => {
    setFormData({
      sourceName: '',
      date: new Date().toISOString().split('T')[0],
      doctorName: '',
      medications: [{ drugName: '', dosage: '', frequency: 'Once daily' }],
      labTests: [{ testName: '', value: '', unit: 'mg/dL', referenceRangeText: '', referenceRangeLow: 0, referenceRangeHigh: 100, status: 'normal' }],
      vaccineName: '',
      doseNumber: 1,
      nextDueDate: '',
      batchNumber: '',
      facility: ''
    });
    setOcrResult({
      confidence: 'high',
      detectedType: selectedType,
      sourceName: 'Manual Entry',
      rawText: 'Manual clinical entry'
    });
    setStep('review');
  };

  const handleSave = () => {
    if (!formData.sourceName.trim()) {
      addToast('Please provide a provider or hospital/lab name', 'error');
      return;
    }

    if (selectedType === 'prescription') {
      if (formData.medications.length === 0 || !formData.medications[0].drugName.trim()) {
        addToast('Please add at least one medication name', 'error');
        return;
      }
      const firstMed = formData.medications[0];
      const newRec = addRecord({
        type: 'prescription',
        title: `Prescription: ${firstMed.drugName}`,
        sourceName: formData.sourceName,
        imageUrl: previewImage,
        prescription: {
          drugName: firstMed.drugName,
          dosage: firstMed.dosage || '500 mg',
          frequency: firstMed.frequency || 'Once daily',
          instructions: firstMed.instructions || 'As prescribed by physician',
          prescribedDate: formData.date,
          prescribingDoctor: formData.doctorName || 'Attending Physician',
          sourceHospital: formData.sourceName
        }
      });
      navigate(`/app/records/${newRec.id}`);
    } else if (selectedType === 'lab_report') {
      if (formData.labTests.length === 0 || !formData.labTests[0].testName.trim()) {
        addToast('Please add at least one test result', 'error');
        return;
      }
      const newRec = addRecord({
        type: 'lab_report',
        title: `Lab Report: ${formData.labTests[0].testName}${formData.labTests.length > 1 ? ` (+${formData.labTests.length - 1} more)` : ''}`,
        sourceName: formData.sourceName,
        imageUrl: previewImage,
        labResults: formData.labTests.map(t => ({
          testName: t.testName,
          value: typeof t.value === 'string' ? parseFloat(t.value) || 0 : t.value,
          unit: t.unit || 'mg/dL',
          referenceRangeLow: Number(t.referenceRangeLow) || 0,
          referenceRangeHigh: Number(t.referenceRangeHigh) || 100,
          referenceRangeText: t.referenceRangeText || `${t.referenceRangeLow}–${t.referenceRangeHigh} ${t.unit}`,
          testDate: formData.date,
          sourceLab: formData.sourceName,
          status: t.status
        }))
      });
      navigate(`/app/records/${newRec.id}`);
    } else {
      if (!formData.vaccineName.trim()) {
        addToast('Please provide the vaccine name', 'error');
        return;
      }
      const newRec = addRecord({
        type: 'vaccination',
        title: `Vaccination: ${formData.vaccineName}`,
        sourceName: formData.sourceName,
        imageUrl: previewImage,
        vaccination: {
          vaccineName: formData.vaccineName,
          doseNumber: formData.doseNumber || 1,
          dateAdministered: formData.date,
          nextDueDate: formData.nextDueDate || undefined,
          facility: formData.sourceName,
          batchNumber: formData.batchNumber || undefined
        }
      });
      navigate(`/app/records/${newRec.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span>Document Onboarding</span>
            <span>•</span>
            <span className="capitalize">{step} Stage</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {step === 'type' && 'Select Document Category'}
            {step === 'source' && 'Choose Capture Method'}
            {step === 'processing' && 'Processing Clinical OCR'}
            {step === 'review' && 'Verify & Structure Data'}
          </h1>
        </div>

        {/* OCR Simulator Demo Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            OCR Mode:
          </span>
          <select
            value={ocrMode}
            onChange={(e) => setOcrMode(e.target.value as any)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer"
          >
            <option value="default">Default (High Conf)</option>
            <option value="high">Forced High</option>
            <option value="low">Forced Low Conf</option>
            <option value="failed">Simulated Failure</option>
            <option value="mismatch">Category Mismatch</option>
          </select>
        </div>
      </div>

      {/* STEP 1: SELECT DOCUMENT TYPE */}
      {step === 'type' && (
        <div className="space-y-6 animate-fadeIn">
          <p className="text-sm text-slate-600">
            Categorizing your document ensures HealthVault accurately extracts medical parameters and maintains timeline integrity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Prescription */}
            <div
              onClick={() => setSelectedType('prescription')}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedType === 'prescription'
                  ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Prescription</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Doctor consult notes, prescribed medications, dosage instructions, and refill schedules.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-teal-800">
                  {selectedType === 'prescription' ? 'Selected' : 'Select'}
                </span>
                <CheckCircle2 className={`w-5 h-5 ${selectedType === 'prescription' ? 'text-teal-600' : 'text-slate-300'}`} />
              </div>
            </div>

            {/* Lab Report */}
            <div
              onClick={() => setSelectedType('lab_report')}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedType === 'lab_report'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Lab Report</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Biochemical tests, blood panels, lipid profiles, reference range intervals, and diagnostics.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-indigo-700">
                  {selectedType === 'lab_report' ? 'Selected' : 'Select'}
                </span>
                <CheckCircle2 className={`w-5 h-5 ${selectedType === 'lab_report' ? 'text-indigo-600' : 'text-slate-300'}`} />
              </div>
            </div>

            {/* Vaccination */}
            <div
              onClick={() => setSelectedType('vaccination')}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedType === 'vaccination'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
                  <Syringe className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Vaccination</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Immunization certificates, dose numbers, booster records, and upcoming vaccination schedules.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-emerald-800">
                  {selectedType === 'vaccination' ? 'Selected' : 'Select'}
                </span>
                <CheckCircle2 className={`w-5 h-5 ${selectedType === 'vaccination' ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Unsure?</span>
            <span>Choose Lab Report for numerical pathology tests, or Prescription for written medicine regimens.</span>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep('source')}
            >
              Continue to Source Selection
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT SOURCE */}
      {step === 'source' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('type')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Change category ({selectedType.replace('_', ' ')})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Option */}
            <div
              onClick={() => setIsCameraOpen(true)}
              className="p-6 rounded-xl border border-slate-200 bg-white hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Take Photo</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Capture physical documents with auto-alignment and simulated optical edge detection.
              </p>
              <span className="mt-4 text-xs font-semibold text-teal-700 flex items-center gap-1">
                Open Camera Viewfinder &rarr;
              </span>
            </div>

            {/* File Upload Option */}
            <label className="p-6 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-teal-600 hover:bg-teal-50/20 transition-all cursor-pointer group flex flex-col items-center text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      handleStartOCR(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    handleStartOCR('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80');
                  }
                }}
              />
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Upload File or Photo</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Drag and drop your file here, or click to browse. Supports JPG, PNG, and PDF up to 10MB.
              </p>
              <span className="mt-4 text-xs font-semibold text-indigo-700 flex items-center gap-1">
                Browse System Files &rarr;
              </span>
            </label>

            {/* Manual Entry Option */}
            <div
              onClick={handleManualEntry}
              className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform mb-3">
                <Edit3 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Enter Manually</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Type in lab metrics, medication names, or vaccines without uploading an image.
              </p>
              <span className="mt-4 text-xs font-semibold text-slate-700">
                Skip to Blank Form &rarr;
              </span>
            </div>

            {/* ABDM Link Option */}
            <div
              onClick={() => {
                addToast('Simulating ABDM Ayushman Bharat Gateway sync...', 'info');
                setTimeout(() => {
                  handleStartOCR('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80');
                }, 900);
              }}
              className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                ABDM Sync
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform mb-3">
                <Link2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pull from ABHA Health Locker</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Directly import verified FHIR records from linked hospitals and laboratories.
              </p>
              <span className="mt-4 text-xs font-semibold text-emerald-700">
                Simulate ABDM Pull &rarr;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: OCR PROCESSING SCREEN */}
      {step === 'processing' && (
        <Card className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto shadow-md">
          {/* Scanning Animation Frame */}
          <div className="relative w-48 h-60 bg-slate-100 rounded-xl overflow-hidden border-2 border-teal-600/40 shadow-inner mb-6">
            <img
              src={previewImage}
              alt="Scanning Document"
              className="w-full h-full object-cover opacity-60 filter contrast-125"
            />
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#059669] animate-bounce" />
            <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-[0.5px]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Analyzing Health Document
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Extracting medical terminology, numerical measurements, and clinical entities...
          </p>

          {/* Stepped Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                {ocrStageText}
              </span>
              <span>{Math.round(((ocrStage + 1) / 4) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                style={{ width: `${((ocrStage + 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('source')}
            >
              Cancel Extraction
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 'review' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner: Mismatch Recovery */}
          {ocrResult?.mismatchDetected && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900">Document Type Mismatch Detected</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  You selected <strong>{selectedType.replace('_', ' ')}</strong>, but our clinical layout detector found characteristics of a <strong>{ocrResult.detectedType.replace('_', ' ')}</strong>.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedType(ocrResult.detectedType);
                      addToast(`Switched record type to ${ocrResult.detectedType.replace('_', ' ')}`);
                    }}
                    className="text-xs font-semibold bg-amber-600 text-white px-2.5 py-1 rounded hover:bg-amber-700 transition-colors"
                  >
                    Switch to {ocrResult.detectedType.replace('_', ' ')}
                  </button>
                  <button
                    onClick={() => setOcrResult({ ...ocrResult, mismatchDetected: false })}
                    className="text-xs font-medium text-amber-800 hover:underline px-2 py-1"
                  >
                    Keep as {selectedType.replace('_', ' ')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Banner: Low Confidence Warning */}
          {ocrResult?.confidence === 'low' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-orange-900">Low OCR Confidence</h4>
                <p className="text-xs text-orange-700 mt-0.5">
                  Some handwriting or faint print could not be transcribed reliably. Please double-check all extracted numbers and dates below before confirming.
                </p>
              </div>
            </div>
          )}

          {/* Banner: OCR Failure State */}
          {ocrResult?.confidence === 'failed' && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-red-900">Document Could Not Be Extracted</h4>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                The optical scanner could not read text from this file due to blurriness, extreme low light, or unsupported formatting.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep('source')}>
                  Retake or Upload Again
                </Button>
                <Button variant="primary" size="sm" onClick={handleManualEntry}>
                  Fill In Manually
                </Button>
              </div>
            </div>
          )}

          {/* Main Review Layout (Side-by-side or Stacked) */}
          {ocrResult?.confidence !== 'failed' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Image Preview Card */}
              <div className="lg:col-span-4 space-y-3">
                <Card className="p-3 sticky top-20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Source Document</span>
                    <button
                      onClick={() => setIsViewerOpen(true)}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Fullscreen
                    </button>
                  </div>
                  <div
                    onClick={() => setIsViewerOpen(true)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group"
                  >
                    <img
                      src={previewImage}
                      alt="Extracted Record"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 px-3 py-1.5 rounded-full shadow">
                        Click to Inspect
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>File: capture_{new Date().getTime().toString().slice(-4)}.jpg</span>
                    <Badge variant="neutral">Verified Optical Capture</Badge>
                  </div>
                </Card>
              </div>

              {/* Right Column: Editable Clinical Form */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-5 space-y-6">
                  {/* General Metadata Header */}
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-slate-900">Clinical Record Attributes</h3>
                      <Badge variant={ocrResult?.confidence === 'high' ? 'success' : 'warning'}>
                        {ocrResult?.confidence === 'high' ? 'High Confidence OCR' : 'Needs Verification'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            {selectedType === 'prescription' ? 'Hospital / Clinic' : selectedType === 'lab_report' ? 'Laboratory Name' : 'Administering Facility'}
                          </label>
                          {manuallyModified['sourceName'] ? (
                            <span className="text-[10px] text-amber-700 font-medium">Manually corrected</span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-medium">Extracted by OCR</span>
                          )}
                        </div>
                        <Input
                          value={formData.sourceName}
                          onChange={(e) => {
                            setFormData({ ...formData, sourceName: e.target.value });
                            markFieldEdited('sourceName');
                          }}
                          placeholder="e.g. Dr. Lal PathLabs, Apollo Clinic"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Record / Specimen Date</label>
                          {manuallyModified['date'] ? (
                            <span className="text-[10px] text-amber-700 font-medium">Manually corrected</span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-medium">Extracted by OCR</span>
                          )}
                        </div>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            setFormData({ ...formData, date: e.target.value });
                            markFieldEdited('date');
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SPECIFIC FIELDS: PRESCRIPTION */}
                  {selectedType === 'prescription' && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Prescribing Physician</label>
                          {manuallyModified['doctorName'] ? (
                            <span className="text-[10px] text-amber-700 font-medium">Manually corrected</span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-medium">Extracted by OCR</span>
                          )}
                        </div>
                        <Input
                          value={formData.doctorName}
                          onChange={(e) => {
                            setFormData({ ...formData, doctorName: e.target.value });
                            markFieldEdited('doctorName');
                          }}
                          placeholder="e.g. Dr. Arvind Swaminathan, MD"
                        />
                      </div>

                      {/* Medications Table / List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Prescribed Medications ({formData.medications.length})
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                medications: [
                                  ...formData.medications,
                                  { drugName: '', dosage: '', frequency: 'Once daily' }
                                ]
                              });
                            }}
                          >
                            Add Medication
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {formData.medications.map((med, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Medication #{idx + 1}</span>
                                {formData.medications.length > 1 && (
                                  <button
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        medications: formData.medications.filter((_, i) => i !== idx)
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input
                                  label="Drug Name"
                                  value={med.drugName}
                                  onChange={(e) => {
                                    const updated = [...formData.medications];
                                    updated[idx].drugName = e.target.value;
                                    setFormData({ ...formData, medications: updated });
                                    markFieldEdited(`med_${idx}`);
                                  }}
                                  placeholder="e.g. Metformin"
                                />
                                <Input
                                  label="Dosage / Strength"
                                  value={med.dosage}
                                  onChange={(e) => {
                                    const updated = [...formData.medications];
                                    updated[idx].dosage = e.target.value;
                                    setFormData({ ...formData, medications: updated });
                                    markFieldEdited(`med_${idx}`);
                                  }}
                                  placeholder="e.g. 500 mg"
                                />
                                <Input
                                  label="Frequency"
                                  value={med.frequency}
                                  onChange={(e) => {
                                    const updated = [...formData.medications];
                                    updated[idx].frequency = e.target.value;
                                    setFormData({ ...formData, medications: updated });
                                    markFieldEdited(`med_${idx}`);
                                  }}
                                  placeholder="e.g. Twice daily"
                                />
                              </div>
                              <Input
                                label="Directions / Instructions"
                                value={med.instructions || ''}
                                onChange={(e) => {
                                  const updated = [...formData.medications];
                                  updated[idx].instructions = e.target.value;
                                  setFormData({ ...formData, medications: updated });
                                  markFieldEdited(`med_${idx}`);
                                }}
                                placeholder="e.g. Take with water after meals. Monitor glucose."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC FIELDS: LAB REPORT */}
                  {selectedType === 'lab_report' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Extracted Lab Parameters ({formData.labTests.length})
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              labTests: [
                                ...formData.labTests,
                                {
                                  testName: '',
                                  value: '',
                                  unit: 'mg/dL',
                                  referenceRangeText: '70–99 mg/dL',
                                  referenceRangeLow: 70,
                                  referenceRangeHigh: 99,
                                  status: 'normal'
                                }
                              ]
                            });
                          }}
                        >
                          Add Test Row
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {formData.labTests.map((test, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Test #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  test.status === 'high' ? 'bg-red-100 text-red-800' :
                                  test.status === 'low' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {test.status}
                                </span>
                                {formData.labTests.length > 1 && (
                                  <button
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        labTests: formData.labTests.filter((_, i) => i !== idx)
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div className="sm:col-span-2">
                                <Input
                                  label="Test Name"
                                  value={test.testName}
                                  onChange={(e) => {
                                    const updated = [...formData.labTests];
                                    updated[idx].testName = e.target.value;
                                    setFormData({ ...formData, labTests: updated });
                                    markFieldEdited(`lab_${idx}`);
                                  }}
                                  placeholder="e.g. Fasting Blood Glucose"
                                />
                              </div>
                              <div>
                                <Input
                                  label="Result Value"
                                  type="number"
                                  value={test.value}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const updated = [...formData.labTests];
                                    updated[idx].value = e.target.value;
                                    if (val > updated[idx].referenceRangeHigh) {
                                      updated[idx].status = 'high';
                                    } else if (val < updated[idx].referenceRangeLow) {
                                      updated[idx].status = 'low';
                                    } else {
                                      updated[idx].status = 'normal';
                                    }
                                    setFormData({ ...formData, labTests: updated });
                                    markFieldEdited(`lab_${idx}`);
                                  }}
                                  placeholder="142"
                                />
                              </div>
                              <div>
                                <Input
                                  label="Unit"
                                  value={test.unit}
                                  onChange={(e) => {
                                    const updated = [...formData.labTests];
                                    updated[idx].unit = e.target.value;
                                    setFormData({ ...formData, labTests: updated });
                                    markFieldEdited(`lab_${idx}`);
                                  }}
                                  placeholder="mg/dL"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              <Input
                                label="Ref Min"
                                type="number"
                                value={test.referenceRangeLow}
                                onChange={(e) => {
                                  const updated = [...formData.labTests];
                                  updated[idx].referenceRangeLow = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, labTests: updated });
                                  markFieldEdited(`lab_${idx}`);
                                }}
                              />
                              <Input
                                label="Ref Max"
                                type="number"
                                value={test.referenceRangeHigh}
                                onChange={(e) => {
                                  const updated = [...formData.labTests];
                                  updated[idx].referenceRangeHigh = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, labTests: updated });
                                  markFieldEdited(`lab_${idx}`);
                                }}
                              />
                              <Input
                                label="Reference Text Display"
                                value={test.referenceRangeText}
                                onChange={(e) => {
                                  const updated = [...formData.labTests];
                                  updated[idx].referenceRangeText = e.target.value;
                                  setFormData({ ...formData, labTests: updated });
                                  markFieldEdited(`lab_${idx}`);
                                }}
                                placeholder="70–99 mg/dL"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC FIELDS: VACCINATION */}
                  {selectedType === 'vaccination' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Vaccine Formulation Name</label>
                          {manuallyModified['vaccineName'] ? (
                            <span className="text-[10px] text-amber-700 font-medium">Manually corrected</span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-medium">Extracted by OCR</span>
                          )}
                        </div>
                        <Input
                          value={formData.vaccineName}
                          onChange={(e) => {
                            setFormData({ ...formData, vaccineName: e.target.value });
                            markFieldEdited('vaccineName');
                          }}
                          placeholder="e.g. Influenza (Quadrivalent), COVID-19 mRNA"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Dose Sequence Number</label>
                        <Input
                          type="number"
                          value={formData.doseNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, doseNumber: parseInt(e.target.value) || 1 });
                            markFieldEdited('doseNumber');
                          }}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Next Booster / Due Date (Optional)</label>
                        <Input
                          type="date"
                          value={formData.nextDueDate}
                          onChange={(e) => {
                            setFormData({ ...formData, nextDueDate: e.target.value });
                            markFieldEdited('nextDueDate');
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Batch / Lot Number (Optional)</label>
                        <Input
                          value={formData.batchNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, batchNumber: e.target.value });
                            markFieldEdited('batchNumber');
                          }}
                          placeholder="e.g. INF-2025-08X"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setShowDiscardDialog(true)}
                    >
                      Discard Record
                    </Button>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setStep('source')}
                      >
                        Re-scan Document
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={handleSave}
                      >
                        Save to HealthVault
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Live Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imgData) => {
          setIsCameraOpen(false);
          handleStartOCR(imgData);
        }}
      />

      {/* Document Fullscreen Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={previewImage}
        title={`Uploaded ${selectedType.replace('_', ' ')}`}
      />

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDiscardDialog}
        title="Discard Unsaved Record?"
        message="Are you sure you want to discard this record? Any extracted clinical data will be permanently cleared."
        confirmText="Yes, Discard"
        cancelText="Keep Editing"
        variant="danger"
        onConfirm={() => {
          setShowDiscardDialog(false);
          navigate('/app/timeline');
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </div>
  );
};

export default UploadFlowPage;
