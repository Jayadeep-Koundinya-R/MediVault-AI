import { z } from 'zod';

export const HealthSummarySchema = z.object({
  overview: z.string().min(10, "Overview summary must be informative"),
  trends: z.array(
    z.object({
      metric: z.string(),
      status: z.enum(['stable', 'improving', 'concerning', 'indeterminate']),
      change: z.string(),
      explanation: z.string(),
    })
  ).default([]),
  observations: z.array(z.string()).default([]),
  suggestedQuestionsForDoctor: z.array(z.string()).default([]),
  disclaimer: z.string().default(
    "Clinical disclaimer: This summary is generated for personal information and organization purposes only. It does not constitute medical diagnosis, treatment advice, or formal clinical evaluation. Always discuss these findings with a licensed healthcare practitioner."
  ),
});

export type HealthSummaryOutput = z.infer<typeof HealthSummarySchema>;

export const ClinicalExtractionSchema = z.object({
  recordType: z.enum(['prescription', 'lab_report', 'vaccination']),
  confidence: z.number().min(0).max(100),
  extractedDate: z.string().nullable().optional(),
  prescriptions: z.array(
    z.object({
      drug_name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      prescribing_doctor: z.string().optional(),
      source_hospital: z.string().optional(),
    })
  ).default([]),
  labResults: z.array(
    z.object({
      test_name: z.string(),
      value: z.number(),
      unit: z.string(),
      reference_range_low: z.number().optional().nullable(),
      reference_range_high: z.number().optional().nullable(),
      source_lab: z.string().optional(),
    })
  ).default([]),
  vaccinations: z.array(
    z.object({
      vaccine_name: z.string(),
      dose_number: z.number().default(1),
      date_administered: z.string(),
      facility: z.string().optional(),
      next_due_date: z.string().optional().nullable(),
    })
  ).default([]),
  notes: z.string().optional(),
});

export type ClinicalExtractionOutput = z.infer<typeof ClinicalExtractionSchema>;
