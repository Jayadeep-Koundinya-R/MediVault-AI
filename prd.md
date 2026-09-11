# Product Requirements Document — HealthVault (Digital Health Record App)

**Hackathon:** Devert-a-thon
**Problem Statement:** DVPS24 — Healthcare Technology
**Original Statement:** "A digital health record app that consolidates prescriptions, lab reports, and vaccination records across multiple hospitals via OCR."

*"HealthVault" is a placeholder name — swap it throughout if you're calling the project something else.*

## 1. Problem

Patients' health records are scattered across paper prescriptions, printed lab reports, and vaccination cards from different hospitals and clinics, with no single timeline or summary. This makes it hard for patients to track their own health history or hand a new doctor the full picture.

## 2. Objective

Build a mobile app that uses OCR to digitize and consolidate prescriptions, lab reports, and vaccination records into one searchable timeline, with an AI-generated summary that highlights trends and flags values outside normal medical reference ranges.

## 3. Target Users

- Patients managing their own or a family member's health records across multiple hospitals/clinics
- People with chronic conditions who need to track lab trends over time (e.g., diabetes, hypertension)
- Anyone who needs to quickly share their health history with a new doctor

## 4. Core Features (MVP)

1. **Document Upload & OCR** — Capture or upload photos of prescriptions, lab reports, and vaccination cards; extract text via OCR.
2. **Structured Parsing** — Convert raw OCR text into structured fields (test name/value/unit/reference range/date for labs; drug/dosage/date for prescriptions; vaccine/date for vaccination records).
3. **Consolidated Timeline** — A single chronological view of all records, filterable by type and source.
4. **AI Health Summary** — LLM-generated plain-language summary of the record history, including trend detection across repeated lab tests (e.g., rising/falling values over time).
5. **Threshold-Based Risk Flags** — Flag lab values that cross established, published clinical reference ranges (e.g., fasting glucose ≥126 mg/dL). Flags cite the specific threshold, not an opaque model prediction.
6. **Manual Correction** — Let users edit any OCR-extracted field, since OCR (especially on handwriting) won't be 100% accurate.

## 5. Stretch Features (if time allows)

- Regional-language summary output
- Medicine reminder notifications based on parsed prescriptions
- Export/share a record or summary as PDF for a doctor visit
- Multiple profiles under one account (e.g., for family members)

## 6. Explicitly Out of Scope

- **Disease prediction / diagnosis.** The app flags values against known thresholds; it does not claim to predict future conditions. Real predictive modeling needs validated longitudinal datasets and clinical outcomes data that aren't available in a hackathon timeframe.
- Direct integration with hospital EHR systems (too complex for the timeline; OCR-based capture sidesteps this).
- Replacing professional medical advice — every flagged item should carry a "consult a doctor" note, not a diagnosis.

## 7. Non-Functional Requirements

- **Privacy:** Health data is sensitive personal data under India's DPDP Act — data should be encrypted at rest, with a clear consent step before storing records.
- **OCR accuracy:** Printed lab/vaccination documents should parse reliably; handwritten prescriptions should degrade gracefully to manual entry rather than silently showing wrong data.
- **Performance:** OCR + summary generation should complete within a few seconds for a smooth demo.

## 8. Success Criteria (for the hackathon demo)

- Upload a sample prescription, lab report, and vaccination card and show all three consolidated in one timeline.
- Show at least one AI-generated summary that references a trend across two or more lab reports.
- Show at least one correctly triggered threshold-based flag with its cited reference range.
