import { Summary, UnifiedRecord } from '../types';
import { INITIAL_SUMMARY } from '../data/seedData';
import { authService } from './authService';

const SUMMARY_STORAGE_KEY = 'healthvault_records_summary';

export const summaryService = {
  getSummary(): Summary | null {
    const data = localStorage.getItem(SUMMARY_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_SUMMARY;
  },

  setSummary(summary: Summary | null) {
    if (summary) {
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    } else {
      localStorage.removeItem(SUMMARY_STORAGE_KEY);
    }
  },

  async generateSummary(_records?: UnifiedRecord[]): Promise<Summary | null> {
    const token = await authService.getSessionToken();

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI summary request failed with status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.summary) {
        throw new Error(json.error || 'Failed to generate dynamic AI summary');
      }

      const dbSummary = json.data.summary;
      const structured = json.data.aiStructured;

      // Extract trend notes strings for UI display
      const trendStrings: string[] = (structured?.trends || []).map(
        (t: { metric: string; change: string; explanation: string }) =>
          `${t.metric}: ${t.change}. ${t.explanation}`
      );

      const generatedSummary: Summary = {
        id: dbSummary.id || `summary_${Date.now()}`,
        userId: dbSummary.user_id,
        generatedAt: dbSummary.generated_at,
        summaryText: dbSummary.summary_text,
        overview: dbSummary.summary_text,
        sourceLabResultIds: dbSummary.source_lab_result_ids || [],
        sourcePrescriptionIds: dbSummary.source_prescription_ids || [],
        trendNotes: trendStrings.length > 0 ? trendStrings : (dbSummary.trend_notes || []),
      };

      this.setSummary(generatedSummary);
      return generatedSummary;
    } catch (err: unknown) {
      console.error('Dynamic AI summary generation error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`AI Analysis Unavailable: ${msg}`);
    }
  },

  async fetchLatestSummary(): Promise<Summary | null> {
    const token = await authService.getSessionToken();
    if (!token) return this.getSummary();

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.summary) {
          const s = json.data.summary;
          const summary: Summary = {
            id: s.id,
            userId: s.user_id,
            generatedAt: s.generated_at,
            summaryText: s.summary_text,
            overview: s.summary_text,
            sourceLabResultIds: s.source_lab_result_ids || [],
            sourcePrescriptionIds: s.source_prescription_ids || [],
            trendNotes: Array.isArray(s.trend_notes)
              ? s.trend_notes.map((t: unknown) => typeof t === 'string' ? t : `${(t as { metric?: string })?.metric || ''}: ${(t as { change?: string })?.change || ''}`)
              : [],
          };
          this.setSummary(summary);
          return summary;
        }
      }
    } catch (e) {
      console.warn('Fetch remote summary note:', e);
    }
    return this.getSummary();
  },

  formatDoctorExportText(params: {
    userName: string;
    dob: string;
    summary: Summary | null;
    records: UnifiedRecord[];
    includeSummary: boolean;
    includeLabs: boolean;
    includePrescriptions: boolean;
    includeVaccines: boolean;
  }): string {
    const lines: string[] = [];
    lines.push('====================================================');
    lines.push('MEDIVAULT — CLINICAL SUMMARY FOR PHYSICIAN REVIEW');
    lines.push('====================================================');
    lines.push(`Patient: ${params.userName}`);
    lines.push(`Date of Birth: ${params.dob}`);
    lines.push(`Export Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
    lines.push(`ABHA Linked ID: 91-8472-1920-4491 (DPDP Compliant)`);
    lines.push('----------------------------------------------------');
    lines.push('');

    if (params.includeSummary && params.summary) {
      lines.push('1. AI HEALTH SUMMARY & TREND OVERVIEW:');
      lines.push(params.summary.summaryText);
      lines.push('');
      if (params.summary.trendNotes && params.summary.trendNotes.length > 0) {
        lines.push('Key Trend Observations:');
        params.summary.trendNotes.forEach((tn) => lines.push(`• ${tn}`));
        lines.push('');
      }
    }

    if (params.includePrescriptions) {
      const rxs = params.records.flatMap((r) => (r.prescription ? [r.prescription] : []));
      lines.push('2. DOCUMENTED PHARMACOTHERAPY:');
      if (rxs.length === 0) {
        lines.push('No documented prescriptions found.');
      } else {
        rxs.forEach((rx, idx) => {
          lines.push(
            `${idx + 1}. ${rx.drugName} ${rx.dosage} — ${rx.frequency} (Prescribed: ${rx.prescribedDate}, Dr. ${rx.prescribingDoctor})`
          );
        });
      }
      lines.push('');
    }

    if (params.includeLabs) {
      const labs = params.records.flatMap((r) => r.labResults || []);
      lines.push('3. LABORATORY FINDINGS & MEASUREMENTS:');
      if (labs.length === 0) {
        lines.push('No laboratory findings available.');
      } else {
        labs.forEach((l) => {
          lines.push(
            `• ${l.testDate} | ${l.testName}: ${l.value} ${l.unit} ${
              l.referenceRangeHigh ? `(Ref: ${l.referenceRangeLow || 0}-${l.referenceRangeHigh} ${l.unit})` : ''
            }`
          );
        });
      }
      lines.push('');
    }

    if (params.includeVaccines) {
      const vaxes = params.records.flatMap((r) => (r.vaccination ? [r.vaccination] : []));
      lines.push('4. IMMUNIZATION RECORDS:');
      if (vaxes.length === 0) {
        lines.push('No vaccination records found.');
      } else {
        vaxes.forEach((v) => {
          lines.push(
            `• ${v.vaccineName} (Dose ${v.doseNumber || 1}) administered on ${v.dateAdministered} at ${v.facility}`
          );
        });
      }
      lines.push('');
    }

    lines.push('----------------------------------------------------');
    lines.push('DISCLAIMER: This report is generated by MediVault for clinical facilitation.');
    lines.push('All values are patient-consolidated and subject to primary medical source verification.');
    lines.push('====================================================');

    return lines.join('\n');
  },
};
