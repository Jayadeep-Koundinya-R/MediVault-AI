# Data Schema — HealthVault

Structured as Firestore-style documents (adjust field types if using a different DB — the shape stays the same). IDs are auto-generated document IDs unless noted.

## User

```
users/{userId}
  name: string
  dateOfBirth: string (ISO date)
  createdAt: timestamp
```

## Document (raw upload record)

```
documents/{documentId}
  userId: string (ref -> users)
  type: enum ["prescription", "lab_report", "vaccination"]
  imageUrl: string (Storage path)
  uploadedAt: timestamp
  ocrStatus: enum ["pending", "success", "low_confidence", "failed"]
  rawOcrText: string
```

## Prescription

```
prescriptions/{prescriptionId}
  documentId: string (ref -> documents)
  userId: string (ref -> users)
  drugName: string
  dosage: string            // e.g. "500mg"
  frequency: string         // e.g. "twice daily"
  prescribedDate: string (ISO date)
  prescribingDoctor: string (optional)
  sourceHospital: string (optional)
  manuallyCorrected: boolean
```

## Lab Report Entry

One row per individual test within a report — a single uploaded lab report can produce several entries.

```
labResults/{labResultId}
  documentId: string (ref -> documents)
  userId: string (ref -> users)
  testName: string           // e.g. "Fasting Glucose"
  value: number
  unit: string                // e.g. "mg/dL"
  referenceRangeLow: number (optional)
  referenceRangeHigh: number (optional)
  testDate: string (ISO date)
  sourceLab: string (optional)
  manuallyCorrected: boolean
```

## Vaccination

```
vaccinations/{vaccinationId}
  documentId: string (ref -> documents)
  userId: string (ref -> users)
  vaccineName: string
  doseNumber: number (optional)
  dateAdministered: string (ISO date)
  facility: string (optional)
  nextDueDate: string (ISO date, optional)
```

## AI Summary

```
summaries/{summaryId}
  userId: string (ref -> users)
  generatedAt: timestamp
  summaryText: string
  sourceLabResultIds: array<string>
  sourcePrescriptionIds: array<string>
  trendNotes: array<string>   // e.g. "Fasting glucose rising over last 3 tests"
```

## Risk Flag

```
riskFlags/{flagId}
  userId: string (ref -> users)
  labResultId: string (ref -> labResults)
  ruleTriggered: string        // e.g. "fasting_glucose_diabetic_threshold"
  thresholdDescription: string // e.g. "Fasting glucose >= 126 mg/dL (ADA/WHO diabetes threshold)"
  severity: enum ["info", "moderate", "high"]
  flaggedAt: timestamp
  acknowledged: boolean
```

## Notes

- `manuallyCorrected` on prescriptions/labs is worth keeping visible in the UI — it's a fast way to show judges you handle OCR errors gracefully instead of pretending it's always perfect.
- Keep `thresholdDescription` human-readable and always shown in the UI next to a flag — that's what makes flags explainable instead of a black box.
