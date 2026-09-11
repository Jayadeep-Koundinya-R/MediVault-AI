import { RecordType, Prescription, LabResult, Vaccination } from '../types';

export interface OCRProcessingResult {
  confidence: 'high' | 'low' | 'failed';
  detectedType: RecordType;
  rawText: string;
  sourceName: string;
  extractedPrescription?: Partial<Prescription>;
  extractedLabResults?: Partial<LabResult>[];
  extractedVaccination?: Partial<Vaccination>;
  mismatchDetected?: boolean;
}

export const ocrService = {
  // Configurable demo override
  simulatedMode: 'default' as 'default' | 'high' | 'low' | 'failed' | 'mismatch',

  setSimulatedMode(mode: 'default' | 'high' | 'low' | 'failed' | 'mismatch') {
    this.simulatedMode = mode;
  },

  async processDocument(
    selectedType: RecordType,
    _fileOrImageData: string | File,
    onProgressUpdate?: (stage: number, stageName: string) => void
  ): Promise<OCRProcessingResult> {
    const stages = [
      'Uploading document',
      'Detecting text',
      'Extracting health information',
      'Preparing structured record'
    ];

    for (let i = 0; i < stages.length; i++) {
      if (onProgressUpdate) {
        onProgressUpdate(i, stages[i]);
      }
      await new Promise(r => setTimeout(r, 600));
    }

    // Check forced demo mode
    if (this.simulatedMode === 'failed') {
      return {
        confidence: 'failed',
        detectedType: selectedType,
        sourceName: '',
        rawText: ''
      };
    }

    if (this.simulatedMode === 'low') {
      return {
        confidence: 'low',
        detectedType: selectedType,
        sourceName: 'Unknown Clinic',
        rawText: 'Unreadable cursive text... Dr. ... Rx: Tab ... 500mg (?) ...'
      };
    }

    if (this.simulatedMode === 'mismatch') {
      return {
        confidence: 'high',
        detectedType: selectedType === 'lab_report' ? 'prescription' : 'lab_report',
        mismatchDetected: true,
        sourceName: 'CityCare Hospital',
        rawText: 'PRESCRIPTION\nDr. Ananya Rao\nTab Metformin 500mg twice daily',
        extractedPrescription: {
          drugName: 'Metformin',
          dosage: '500 mg',
          frequency: 'Twice daily',
          prescribedDate: new Date().toISOString().split('T')[0],
          prescribingDoctor: 'Dr. Ananya Rao',
          sourceHospital: 'CityCare Hospital'
        }
      };
    }

    // Default High Confidence structured return according to selected type
    if (selectedType === 'prescription') {
      return {
        confidence: 'high',
        detectedType: 'prescription',
        sourceName: 'Fortis Healthcare',
        rawText: 'FORTIS HEALTHCARE - ENDOCRINOLOGY\nDr. Arvind Swaminathan, MD\nRx:\nTab Metformin 500mg - 1 tab twice daily after meals\nPrescribed Date: 18 Aug 2026',
        extractedPrescription: {
          drugName: 'Metformin',
          dosage: '500 mg',
          frequency: 'Twice daily',
          prescribedDate: '2026-08-18',
          prescribingDoctor: 'Dr. Arvind Swaminathan',
          sourceHospital: 'Fortis Healthcare',
          instructions: 'Take with water after meals. Monitor fasting glucose.'
        }
      };
    }

    if (selectedType === 'lab_report') {
      return {
        confidence: 'high',
        detectedType: 'lab_report',
        sourceName: 'Dr. Lal PathLabs',
        rawText: 'DR. LAL PATHLABS CLINICAL BIOCHEMISTRY\nPatient: Rahul Sharma, 24/M\nDate: 18-Aug-2026\nFasting Blood Glucose: 142 mg/dL (70-99)\nHbA1c: 6.8 % (4.0-5.6)\nLDL Cholesterol: 148 mg/dL (<100)',
        extractedLabResults: [
          {
            testName: 'Fasting Blood Glucose',
            value: 142,
            unit: 'mg/dL',
            referenceRangeLow: 70,
            referenceRangeHigh: 99,
            referenceRangeText: '70–99 mg/dL',
            testDate: '2026-08-18',
            sourceLab: 'Dr. Lal PathLabs',
            status: 'high'
          },
          {
            testName: 'HbA1c (Glycated Hemoglobin)',
            value: 6.8,
            unit: '%',
            referenceRangeLow: 4.0,
            referenceRangeHigh: 5.6,
            referenceRangeText: '4.0–5.6 %',
            testDate: '2026-08-18',
            sourceLab: 'Dr. Lal PathLabs',
            status: 'high'
          },
          {
            testName: 'LDL Cholesterol',
            value: 148,
            unit: 'mg/dL',
            referenceRangeLow: 0,
            referenceRangeHigh: 100,
            referenceRangeText: '< 100 mg/dL',
            testDate: '2026-08-18',
            sourceLab: 'Dr. Lal PathLabs',
            status: 'high'
          }
        ]
      };
    }

    // Vaccination
    return {
      confidence: 'high',
      detectedType: 'vaccination',
      sourceName: 'Apollo Clinic',
      rawText: 'APOLLO CLINIC IMMUNIZATION LOG\nVaccine: Influvac Tetra 0.5ml\nDose 1 IM Administered 18-Aug-2025\nNext Due: 18-Aug-2026',
      extractedVaccination: {
        vaccineName: 'Influenza (Quadrivalent)',
        doseNumber: 1,
        dateAdministered: '2025-08-18',
        facility: 'Apollo Clinic',
        nextDueDate: '2026-08-18'
      }
    };
  }
};
