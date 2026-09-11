# MediVault-AI (HealthVault)

A production-grade digital health record web application with AI summarization, deterministic clinical threshold flags, longitudinal lab biomarker trends, and full Indian statutory compliance (DPDP Act, 2023 & ABDM).

---

## 🌟 Core Features

- **Longitudinal Clinical Timeline**: Consolidates medical prescriptions, laboratory reports, and immunization records into one unified, searchable, chronological timeline.
- **Dynamic AI Health Summaries (Ollama + Qwen)**: Real-time, non-hardcoded plain-language health summaries and longitudinal trends generated via local Ollama inference using `qwen2.5:7b`, strictly validated against Zod schemas.
- **Deterministic Clinical Threshold Engine**: Strictly rule-based evaluations separating medical guidelines (ADA Fasting Glucose $\ge 126\text{ mg/dL}$, HbA1c $\ge 6.5\%$, LDL $> 100\text{ mg/dL}$, KDIGO eGFR $< 60$) from the AI layer.
- **Supabase Backend & PostgreSQL**: 8 production tables with automated `updated_at` triggers, performance indexes, and strict Row-Level Security (`RLS`) policies.
- **Private Encrypted Storage**: Secure user-isolated document storage for medical records using Supabase Storage.
- **OCR Pipeline**: Document scanning and optical character recognition with Tesseract.js and structured entity extraction.
- **DPDP Act, 2023 Compliance**: Statutory consent gate with explicit Data Fiduciary disclosures, Data Principal statutory rights, zero commercialization guarantee, and consent revocation controls.
- **Doctor Consultation Export**: 1-click clinical consultation brief export formatting active medications, recent lab panels, and critical risk flags.

---

## 🏗️ Architecture

```text
Next.js / React Frontend
        ↓
Supabase Auth (JWT & Auto-confirmation)
        ↓
Server API Route Handlers (/api/*)
        ↓
Supabase PostgreSQL & Private Storage (RLS Enforced)

and

Server Route Handlers (/api/ai/summary)
        ↓
Local Ollama (http://localhost:11434)
        ↓
Qwen Model (qwen2.5:7b)
        ↓
Zod Structured Schema Validation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) with Qwen installed:
  ```bash
  ollama run qwen2.5:7b
  ```

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Jayadeep-Koundinya-R/MediVault-AI.git
cd MediVault-AI
git checkout Ronald

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase credentials and Ollama endpoint:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 4. Database Setup
Apply the PostgreSQL migration:
```bash
npm run migrate
```

### 5. Run the Application
```bash
# Start development server
npm run dev

# Or start with Next.js server
npm run dev:next
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Automated Testing

| Command | Purpose |
| :--- | :--- |
| `npx tsx scripts/verify-backend.js` | Runs the 34-test backend suite (DB, RLS, Storage, Thresholds, Ollama Qwen inference, and non-hardcoded dynamic variation). |
| `node scripts/test-api-e2e.js` | Runs end-to-end HTTP API tests across all 7 endpoints against the running server. |
| `npm run build` | Builds the production bundle (`tsc && vite build`). |

---

## 📋 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health/ai` | `GET` | Diagnostic check confirming local Ollama connectivity and detecting installed Qwen models. |
| `/api/ai/summary` | `GET` / `POST` | Authenticated dynamic health summary generation via Ollama and database retrieval. |
| `/api/timeline` | `GET` | Database-backed query consolidating prescriptions, labs, and vaccinations with text search and filters. |
| `/api/profile` | `GET` / `PATCH` | Authenticated profile management and DPDP consent state query. |
| `/api/consent` | `GET` / `POST` | Lawful consent capture and revocation under the DPDP Act, 2023. |
| `/api/demo/seed` | `POST` | Wipes and seeds authentic clinical history for demo patient Rahul Sharma. |
| `/api/demo/clear` | `POST` | Clears all records for the authenticated user for clean-slate testing. |
| `/api/documents/upload` | `POST` | Uploads to private Storage, executes OCR, and extracts clinical entities with Qwen. |
| `/api/export/summary` | `POST` | Generates formatted physician-facing clinical consultation brief. |

---

## ⚖️ Clinical & Legal Disclaimers

- **Non-Diagnostic Notice**: MediVault-AI is designed for patient record synthesis and clinical facilitation. It does not replace professional medical advice, diagnosis, or treatment.
- **DPDP Act, 2023**: All health data processing adheres to the Digital Personal Data Protection Act of India.