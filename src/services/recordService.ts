import { 
  DocumentRecord, 
  Prescription, 
  LabResult, 
  Vaccination, 
  RiskFlag, 
  UnifiedRecord, 
  RecordType 
} from '../types';
import { 
  INITIAL_DOCUMENTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_LAB_RESULTS, 
  INITIAL_VACCINATIONS, 
  INITIAL_RISK_FLAGS 
} from '../data/seedData';
import { supabase } from '../lib/supabase/client';
import { authService } from './authService';
import { evaluateLabResult } from '../lib/health/thresholds';

const STORAGE_KEYS = {
  DOCUMENTS: 'healthvault_records_documents',
  PRESCRIPTIONS: 'healthvault_records_prescriptions',
  LABS: 'healthvault_records_labs',
  VACCINATIONS: 'healthvault_records_vaccinations',
  FLAGS: 'healthvault_records_flags'
};

export const recordService = {
  // Initialization & Seeding
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      this.resetToDemoData();
    }
  },

  async syncFromRemote(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [docsRes, rxRes, labsRes, vaxRes, flagsRes] = await Promise.all([
        supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
        supabase.from('prescriptions').select('*').eq('user_id', user.id).order('prescribed_date', { ascending: false }),
        supabase.from('lab_results').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
        supabase.from('vaccinations').select('*').eq('user_id', user.id).order('date_administered', { ascending: false }),
        supabase.from('risk_flags').select('*').eq('user_id', user.id).order('flagged_at', { ascending: false }),
      ]);

      if (docsRes.data && docsRes.data.length > 0) {
        const mappedDocs: DocumentRecord[] = docsRes.data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          type: d.type as RecordType,
          title: d.original_filename || (d.type === 'prescription' ? 'Medical Prescription' : 'Lab Report'),
          uploadedAt: d.uploaded_at,
          ocrStatus: d.ocr_status,
          rawOcrText: d.raw_ocr_text,
          imageUrl: d.image_path,
        }));
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(mappedDocs));
      }

      if (rxRes.data) {
        const mappedRx: Prescription[] = rxRes.data.map((r) => ({
          id: r.id,
          documentId: r.document_id,
          userId: r.user_id,
          drugName: r.drug_name,
          dosage: r.dosage,
          frequency: r.frequency,
          prescribedDate: r.prescribed_date,
          prescribingDoctor: r.prescribing_doctor || '',
          sourceHospital: r.source_hospital || '',
          manuallyCorrected: r.manually_corrected,
        }));
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(mappedRx));
      }

      if (labsRes.data) {
        const mappedLabs: LabResult[] = labsRes.data.map((l) => ({
          id: l.id,
          documentId: l.document_id,
          userId: l.user_id,
          testName: l.test_name,
          value: Number(l.value),
          unit: l.unit,
          referenceRangeLow: l.reference_range_low,
          referenceRangeHigh: l.reference_range_high,
          testDate: l.test_date,
          sourceLab: l.source_lab || '',
          manuallyCorrected: l.manually_corrected,
          status: l.reference_range_high && Number(l.value) > l.reference_range_high ? 'high' : 'normal',
        }));
        localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(mappedLabs));
      }

      if (vaxRes.data) {
        const mappedVax: Vaccination[] = vaxRes.data.map((v) => ({
          id: v.id,
          documentId: v.document_id,
          userId: v.user_id,
          vaccineName: v.vaccine_name,
          doseNumber: v.dose_number,
          dateAdministered: v.date_administered,
          facility: v.facility || '',
          nextDueDate: v.next_due_date,
        }));
        localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(mappedVax));
      }

      if (flagsRes.data) {
        const mappedFlags: RiskFlag[] = flagsRes.data.map((f) => ({
          id: f.id,
          userId: f.user_id,
          labResultId: f.lab_result_id,
          testName: f.rule_triggered,
          currentValue: 0,
          unit: '',
          ruleTriggered: f.rule_triggered,
          thresholdDescription: f.threshold_description,
          severity: f.severity,
          flaggedAt: f.flagged_at,
          acknowledged: f.acknowledged,
          explanation: f.threshold_description,
          sourceLab: '',
        }));
        localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(mappedFlags));
      }
    } catch (err) {
      console.warn('Sync from remote database error:', err);
    }
  },

  async resetToDemoData() {
    const token = await authService.getSessionToken();
    if (token) {
      try {
        await fetch('/api/demo/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        await this.syncFromRemote();
        return;
      } catch (e) {
        console.warn('Remote demo seed note:', e);
      }
    }

    // Local fallback
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(INITIAL_PRESCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(INITIAL_LAB_RESULTS));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(INITIAL_VACCINATIONS));
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(INITIAL_RISK_FLAGS));
  },

  async clearAllData() {
    const token = await authService.getSessionToken();
    if (token) {
      try {
        await fetch('/api/demo/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.warn('Remote clear note:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify([]));
  },

  // Raw Read Methods
  getDocuments(): DocumentRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : INITIAL_DOCUMENTS;
  },

  getPrescriptions(): Prescription[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    return data ? JSON.parse(data) : INITIAL_PRESCRIPTIONS;
  },

  getLabResults(): LabResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.LABS);
    return data ? JSON.parse(data) : INITIAL_LAB_RESULTS;
  },

  getVaccinations(): Vaccination[] {
    const data = localStorage.getItem(STORAGE_KEYS.VACCINATIONS);
    return data ? JSON.parse(data) : INITIAL_VACCINATIONS;
  },

  getRiskFlags(): RiskFlag[] {
    const data = localStorage.getItem(STORAGE_KEYS.FLAGS);
    return data ? JSON.parse(data) : INITIAL_RISK_FLAGS;
  },

  // Unified Records Query
  getUnifiedRecords(): UnifiedRecord[] {
    const docs = this.getDocuments();
    const prescriptions = this.getPrescriptions();
    const labs = this.getLabResults();
    const vaxes = this.getVaccinations();
    const flags = this.getRiskFlags();

    return docs.map(doc => {
      const rx = prescriptions.find(p => p.documentId === doc.id);
      const labResults = labs.filter(l => l.documentId === doc.id);
      const vax = vaxes.find(v => v.documentId === doc.id);
      const docFlags = flags.filter(f => labResults.some(lr => lr.id === f.labResultId));

      return {
        id: doc.id,
        document: doc,
        type: doc.type,
        title: doc.title,
        date: doc.uploadedAt,
        sourceName: doc.sourceName || '',
        imageUrl: doc.imageUrl,
        status: (docFlags.some(f => f.severity === 'high') ? 'attention_needed' : docFlags.length > 0 ? 'abnormal' : 'normal') as any,
        prescription: rx,
        labResults: labResults.length > 0 ? labResults : undefined,
        vaccination: vax,
        flags: docFlags.length > 0 ? docFlags : undefined
      };
    }).sort((a, b) => new Date(b.document.uploadedAt).getTime() - new Date(a.document.uploadedAt).getTime());
  },

  getUnifiedRecordById(id: string): UnifiedRecord | null {
    const records = this.getUnifiedRecords();
    return records.find(r => r.id === id) || null;
  },

  // Add Record Method
  createRecord(params: {
    type: RecordType;
    title: string;
    sourceName: string;
    imageUrl?: string;
    prescription?: Omit<Prescription, 'id' | 'documentId' | 'userId'>;
    labResults?: Omit<LabResult, 'id' | 'documentId' | 'userId'>[];
    vaccination?: Omit<Vaccination, 'id' | 'documentId' | 'userId'>;
  }): UnifiedRecord {
    const docId = `doc_${Date.now()}`;
    const user = authService.getCurrentUser();
    const userId = user?.id || 'user_rahul_01';

    const newDoc: DocumentRecord = {
      id: docId,
      userId,
      type: params.type,
      title: params.title || (params.type === 'prescription' ? 'Medical Prescription' : params.type === 'lab_report' ? 'Laboratory Diagnostic Report' : 'Immunization Record'),
      uploadedAt: new Date().toISOString(),
      ocrStatus: 'success',
      sourceName: params.sourceName || 'Healthcare Provider',
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
    };

    const docs = [newDoc, ...this.getDocuments()];
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));

    let createdRx: Prescription | undefined;
    let createdLabs: LabResult[] = [];
    let createdVax: Vaccination | undefined;
    const newFlags: RiskFlag[] = [];

    if (params.type === 'prescription' && params.prescription) {
      createdRx = {
        ...params.prescription,
        id: `rx_${Date.now()}`,
        documentId: docId,
        userId
      };
      const allRx = [createdRx, ...this.getPrescriptions()];
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(allRx));
    } else if (params.type === 'lab_report' && params.labResults) {
      createdLabs = params.labResults.map((lr, idx) => {
        const labId = `lab_res_${Date.now()}_${idx}`;
        const labRes: LabResult = {
          ...lr,
          id: labId,
          documentId: docId,
          userId
        };

        // Deterministic Clinical Threshold Evaluation
        const evaluated = evaluateLabResult({
          id: labId,
          test_name: lr.testName,
          value: lr.value,
          unit: lr.unit,
          reference_range_low: lr.referenceRangeLow,
          reference_range_high: lr.referenceRangeHigh,
          test_date: lr.testDate,
        });

        if (evaluated) {
          newFlags.push({
            id: `flag_${Date.now()}_${idx}`,
            userId,
            labResultId: labId,
            testName: lr.testName,
            currentValue: lr.value,
            unit: lr.unit,
            ruleTriggered: evaluated.rule_triggered,
            thresholdDescription: evaluated.threshold_description,
            severity: evaluated.severity,
            flaggedAt: evaluated.flagged_at,
            acknowledged: false,
            explanation: evaluated.threshold_description,
            sourceLab: params.sourceName,
          });
        }

        return labRes;
      });

      const allLabs = [...createdLabs, ...this.getLabResults()];
      localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(allLabs));

      if (newFlags.length > 0) {
        const allFlags = [...newFlags, ...this.getRiskFlags()];
        localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(allFlags));
      }
    } else if (params.type === 'vaccination' && params.vaccination) {
      createdVax = {
        ...params.vaccination,
        id: `vax_${Date.now()}`,
        documentId: docId,
        userId
      };
      const allVaxes = [createdVax, ...this.getVaccinations()];
      localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(allVaxes));
    }

    // Async remote persistence in background
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        await supabase.from('documents').insert({
          id: docId,
          user_id: authUser.id,
          type: params.type,
          image_path: params.imageUrl || 'manual-entry',
          ocr_status: 'success',
          original_filename: params.title,
        });

        if (createdRx) {
          await supabase.from('prescriptions').insert({
            id: createdRx.id,
            document_id: docId,
            user_id: authUser.id,
            drug_name: createdRx.drugName,
            dosage: createdRx.dosage,
            frequency: createdRx.frequency,
            prescribed_date: createdRx.prescribedDate,
            prescribing_doctor: createdRx.prescribingDoctor,
            source_hospital: createdRx.sourceHospital,
          });
        }

        if (createdLabs.length > 0) {
          await supabase.from('lab_results').insert(
            createdLabs.map((l) => ({
              id: l.id,
              document_id: docId,
              user_id: authUser.id,
              test_name: l.testName,
              value: l.value,
              unit: l.unit,
              reference_range_low: l.referenceRangeLow,
              reference_range_high: l.referenceRangeHigh,
              test_date: l.testDate,
              source_lab: l.sourceLab,
            }))
          );
        }

        if (createdVax) {
          await supabase.from('vaccinations').insert({
            id: createdVax.id,
            document_id: docId,
            user_id: authUser.id,
            vaccine_name: createdVax.vaccineName,
            dose_number: createdVax.doseNumber || 1,
            date_administered: createdVax.dateAdministered,
            facility: createdVax.facility,
            next_due_date: createdVax.nextDueDate || null,
          });
        }

        if (newFlags.length > 0) {
          await supabase.from('risk_flags').insert(
            newFlags.map((f) => ({
              id: f.id,
              user_id: authUser.id,
              lab_result_id: f.labResultId,
              rule_triggered: f.ruleTriggered,
              threshold_description: f.thresholdDescription,
              severity: f.severity,
              flagged_at: f.flaggedAt,
            }))
          );
        }
      } catch (remoteErr) {
        console.warn('Background Supabase persistence note:', remoteErr);
      }
    })();

    return {
      id: docId,
      document: newDoc,
      type: newDoc.type,
      title: newDoc.title,
      date: newDoc.uploadedAt,
      sourceName: newDoc.sourceName || '',
      imageUrl: newDoc.imageUrl,
      status: (newFlags.some(f => f.severity === 'high') ? 'attention_needed' : newFlags.length > 0 ? 'abnormal' : 'normal') as any,
      prescription: createdRx,
      labResults: createdLabs.length > 0 ? createdLabs : undefined,
      vaccination: createdVax,
      flags: newFlags.length > 0 ? newFlags : undefined
    };
  },

  // Delete Record
  deleteRecord(id: string): boolean {
    const docs = this.getDocuments().filter(d => d.id !== id);
    const prescriptions = this.getPrescriptions().filter(p => p.documentId !== id);
    const labs = this.getLabResults().filter(l => l.documentId !== id);
    const vaxes = this.getVaccinations().filter(v => v.documentId !== id);
    const flags = this.getRiskFlags().filter(f => !labs.some(l => l.id === f.labResultId));

    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
    localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(labs));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(vaxes));
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(flags));

    // Remote delete
    (async () => {
      try {
        await supabase.from('documents').delete().eq('id', id);
      } catch (e) {
        console.warn('Remote document delete note:', e);
      }
    })();

    return true;
  },

  // Acknowledge Risk Flag
  acknowledgeFlag(flagId: string): boolean {
    const flags = this.getRiskFlags().map(f => {
      if (f.id === flagId) {
        return { ...f, acknowledged: true };
      }
      return f;
    });
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(flags));

    // Remote update
    (async () => {
      try {
        await supabase
          .from('risk_flags')
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq('id', flagId);
      } catch (e) {
        console.warn('Remote flag acknowledge note:', e);
      }
    })();

    return true;
  }
};

// Auto-initialize on load
recordService.init();
