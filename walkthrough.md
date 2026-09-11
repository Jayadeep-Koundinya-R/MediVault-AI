# HealthVault — Production-Grade Backend, Database & AI Walkthrough

HealthVault has been transitioned from local mock state into a **production-ready full-stack digital health record application** powered by:
- **Supabase**: PostgreSQL database, Supabase Auth with automatic verification, Row-Level Security (RLS) on all tables, and Private Encrypted Storage (`health-documents`).
- **Server API Route Handlers**: Authenticated endpoints for health diagnostics, dynamic AI summarization, timeline filtering, DPDP statutory consent, document OCR upload, and clinical export.
- **Local Ollama + Qwen (`qwen2.5:7b`)**: Real, dynamic, non-hardcoded AI health summarization and structured clinical extraction.
- **Deterministic Clinical Threshold Engine**: Strictly rule-based evaluations separating medical guidelines (ADA Fasting Glucose $\ge 126\text{ mg/dL}$, HbA1c $\ge 6.5\%$, LDL $> 100\text{ mg/dL}$, KDIGO eGFR $< 60$) from the AI layer.
- **Statutory DPDP Compliance**: Complete Indian Digital Personal Data Protection Act compliance with explicit consent gates, audit trails, and withdrawal rights.

---

## 1. Database Architecture & Row-Level Security

### Tables Implemented in Supabase PostgreSQL
All tables feature primary keys, foreign key constraints (`ON DELETE CASCADE`), automated `updated_at` triggers, and indexes on `user_id`, document IDs, test names, and timestamps:

1. `profiles`: `id UUID (PK, references auth.users)`, `full_name`, `date_of_birth`, `email`, `blood_group`, `phone`, `created_at`, `updated_at`
2. `health_consents`: `id UUID (PK)`, `user_id UUID (references auth.users)`, `consent_version`, `consented BOOLEAN`, `consented_at`, `withdrawn_at`, `created_at`
3. `documents`: `id UUID (PK)`, `user_id UUID`, `type CHECK ('prescription', 'lab_report', 'vaccination')`, `image_path`, `uploaded_at`, `ocr_status CHECK ('pending', 'processing', 'success', 'low_confidence', 'failed')`, `raw_ocr_text`, `ocr_confidence`, `original_filename`, `mime_type`, `file_size`
4. `prescriptions`: `id UUID (PK)`, `document_id UUID`, `user_id UUID`, `drug_name`, `dosage`, `frequency`, `prescribed_date`, `prescribing_doctor`, `source_hospital`, `manually_corrected`
5. `lab_results`: `id UUID (PK)`, `document_id UUID`, `user_id UUID`, `test_name`, `value NUMERIC`, `unit`, `reference_range_low`, `reference_range_high`, `test_date`, `source_lab`, `manually_corrected`
6. `vaccinations`: `id UUID (PK)`, `document_id UUID`, `user_id UUID`, `vaccine_name`, `dose_number`, `date_administered`, `facility`, `next_due_date`
7. `summaries`: `id UUID (PK)`, `user_id UUID`, `generated_at`, `summary_text`, `source_lab_result_ids UUID[]`, `source_prescription_ids UUID[]`, `trend_notes JSONB`, `model_name`, `model_provider`, `generation_metadata JSONB`
8. `risk_flags`: `id UUID (PK)`, `user_id UUID`, `lab_result_id UUID`, `rule_triggered`, `threshold_description`, `severity CHECK ('info', 'moderate', 'high')`, `flagged_at`, `acknowledged`, `acknowledged_at`

### Row-Level Security (RLS) & Private Storage
- Every table has RLS enabled with `TO authenticated` policies utilizing the optimized subquery pattern `USING ((SELECT auth.uid()) = user_id)` to ensure zero cross-tenant data leakage.
- Private Supabase Storage bucket `health-documents` (`public = false`) enforces folder isolation: only authenticated users can access `{userId}/*`.

---

## 2. Dynamic Ollama + Qwen AI Pipeline

### Zero-Hardcoding Architecture
Summaries and trends are **never** predefined:
1. Patient's real verified records are fetched directly from PostgreSQL.
2. Context is assembled with strict prompt-injection delimiters (`<<<BEGIN CLINICAL DATA>>> ... <<<END CLINICAL DATA>>>`).
3. Sent to the local Ollama instance (`http://localhost:11434`) running `qwen2.5:7b`.
4. Response is validated against the Zod schema (`HealthSummarySchema`):
   - `overview`: Comprehensive clinical narrative
   - `trends`: Array of `{ metric, status, change, explanation }`
   - `observations`: Key clinical bullet points
   - `suggestedQuestionsForDoctor`: Tailored physician queries
   - `disclaimer`: Mandatory non-diagnostic clinical disclaimer
5. Persisted into the `summaries` table and returned to the UI.

### Deterministic Threshold Engine (Distinct from AI)
- **ADA Diabetes Threshold**: Fasting Glucose $\ge 126\text{ mg/dL}$ (High Severity), $100\text{--}125\text{ mg/dL}$ (Moderate Prediabetes), $< 70\text{ mg/dL}$ (Hypoglycemia).
- **ADA HbA1c Threshold**: $\ge 6.5\%$ (High Severity Diabetes), $5.7\text{--}6.4\%$ (Moderate Prediabetes).
- **AHA/ACC Lipid Targets**: LDL Cholesterol $\ge 160\text{ mg/dL}$ (High Severity Marked Hypercholesterolemia), $> 100\text{ mg/dL}$ (Moderate Suboptimal Target).
- **Renal Guidelines**: eGFR $< 60\text{ mL/min/1.73m}^2$ (KDIGO Impaired Kidney Function).

---

## 3. Server API Route Handlers Implemented

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/health/ai` | `GET` | Diagnostic check confirming local Ollama connectivity and detecting installed Qwen models. |
| `/api/ai/summary` | `GET` | Retrieves latest persisted AI health summary and active clinical risk flags. |
| `/api/ai/summary` | `POST` | Dynamically executes Ollama Qwen inference against authenticated patient records and persists output. |
| `/api/timeline` | `GET` | Database-backed query consolidating prescriptions, labs, and vaccinations with text search and date filters. |
| `/api/profile` | `GET` / `PATCH` | Authenticated profile management and DPDP consent state query. |
| `/api/consent` | `GET` / `POST` | Lawful consent capture and revocation under the DPDP Act, 2023. |
| `/api/demo/seed` | `POST` | Wipes and seeds authentic clinical history for Rahul Sharma (3 Rx, 7 Labs, 2 Vaccines, 3 Risk Flags). |
| `/api/demo/clear` | `POST` | Clears all records for the authenticated user for clean-slate testing. |
| `/api/documents/upload` | `POST` | Uploads to private Storage, executes real OCR, extracts clinical entities with Qwen, and saves records. |
| `/api/export/summary` | `POST` | Generates formatted physician-facing clinical consultation brief with active medications and flags. |

---

## 4. Verification & Automated Test Results

### 1. Database & Schema Verification
- All 8 tables confirmed live in Supabase PostgreSQL: `public.profiles`, `public.health_consents`, `public.documents`, `public.prescriptions`, `public.lab_results`, `public.vaccinations`, `public.summaries`, `public.risk_flags`.
- Private Storage bucket `health-documents` confirmed with `public = false`.
- Row-Level Security confirmed enabled on all 8 tables.

### 2. Clinical Threshold Engine Test
- Fasting Glucose 132 mg/dL $\to$ ADA High Severity Diabetic Threshold Flag [PASS]
- Fasting Glucose 112 mg/dL $\to$ ADA Moderate Impaired Fasting Glucose Flag [PASS]
- Fasting Glucose 88 mg/dL $\to$ Normal (0 flags) [PASS]
- HbA1c 7.1% $\to$ ADA High Severity Threshold Flag [PASS]
- eGFR 48 $\to$ KDIGO Impaired Renal Function Flag [PASS]

### 3. Real Ollama + Qwen Dynamic AI Verification
- Ollama service confirmed active on `http://localhost:11434` with model `qwen2.5:7b`.
- Executed real inference on patient dataset $\to$ Generated structured summary validating strictly against `HealthSummarySchema`.
- **Dynamic Non-Static Test**: Generated summary for Patient A (Rahul Sharma: Metformin, FBS 128 mg/dL, HbA1c 6.8%) versus Patient B (Priya Mehta: Budecort Inhaler, Eosinophils 650). Verified that the model synthesized completely distinct, factual summaries referencing each patient's exact medical details with zero hardcoding.

### 4. End-to-End HTTP API Suite (`scripts/test-api-e2e.js`)
All HTTP requests made against the running server succeeded:
- User Authentication: Real JWT token issued from Supabase Auth
- `POST /api/demo/seed`: 200 OK
- `GET /api/profile`: 200 OK (Rahul Sharma, B+, DPDP Consented)
- `GET /api/timeline`: 200 OK (12 consolidated items retrieved)
- `POST /api/export/summary`: 200 OK (2,200-character physician consultation brief formatted)
- `POST /api/ai/summary`: 200 OK (Real dynamic Ollama Qwen summary generated and persisted)
- `GET /api/ai/summary`: 200 OK (`Persisted summary exists: true`, `model: qwen2.5:7b`)

### 5. Build Verification
- `npm run build`: `tsc && vite build` succeeded in 2.53s with 0 TypeScript errors and 0 build warnings.
