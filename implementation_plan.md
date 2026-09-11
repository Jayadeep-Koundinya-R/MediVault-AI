# Implementation Plan — HealthVault

**Note:** This plan assumes a roughly 24–36 hour hackathon build window (adjust the phase split below if Devert-a-thon's actual duration differs) and a small team of 2–4. Merge roles if you're working solo or in a pair.

## 1. Suggested Tech Stack

- **App shell:** Capacitor + Vite + React — reusing the stack from your last Android build keeps setup friction low, and you already know the config quirks (status bar/safe-area handling, etc.).
- **OCR:** Google ML Kit Text Recognition (on-device, fast, free, works well offline for printed text) as the primary option; Tesseract.js as a fallback if you need it in a pure web context.
- **Backend/storage:** Firebase (Firestore + Storage) — fastest path to a working backend without managing servers; Firestore also maps naturally onto the document-style schema in `schema.md`.
- **AI summary + flagging:** Claude or GPT API for summarization from structured data. Keep the threshold-flagging logic itself as plain rule-based code (not an LLM call) so it's fast, deterministic, and easy to explain to judges.

## 2. Architecture Overview

```
[Camera/Upload] -> [OCR (ML Kit)] -> [Structured Extraction] -> [Firestore]
                                                                      |
                                                       [Timeline UI] <- [Read]
                                                                      |
                                            [LLM Summary + Rule-Based Flags] -> [Summary UI]
```

**Structured extraction** is the piece most worth prototyping first — feed OCR output into an LLM prompt that returns strict JSON matching the schema in `schema.md`, rather than writing a brittle regex parser. It handles format variation across different hospitals/labs far better.

## 3. Phased Plan

### Phase 1 — Setup & Core Upload (first ~20–25%)
- Scaffold the Capacitor/Vite/React app, set up the Firebase project
- Build the document capture/upload screen (camera + gallery picker)
- Wire up ML Kit OCR on a single uploaded image, confirm raw text extraction works

### Phase 2 — Structured Extraction & Storage (next ~25%)
- Lock the schema (see `schema.md`)
- Build the OCR-text -> structured-JSON extraction step (LLM-assisted)
- Add a manual-correction screen so users can fix misread fields
- Save structured records to Firestore

### Phase 3 — Timeline, Summary & Flags (next ~30%)
- Build the consolidated timeline/dashboard UI
- Implement the rule-based threshold flags (start with 2–3 well-known ones: fasting glucose, BP staging, LDL — enough to demo convincingly)
- Implement the LLM summary call over a user's structured record history, with trend detection across repeated tests
- Display flags and summary in the UI, each flag showing its source threshold

### Phase 4 — Polish & Demo Prep (final ~15–20%)
- Seed realistic demo data (a few sample prescriptions/labs/vaccination records showing a visible trend, so the summary and flags have something meaningful to show)
- Fix obvious UI rough edges
- Prepare the pitch: lead with the working summary+flagging pipeline, and mention predictive modeling as a clearly-labeled future roadmap item rather than something built now

## 4. Key Risks & Mitigations

- **OCR accuracy on handwritten prescriptions** — don't bet the demo on this; prioritize printed lab reports/vaccination cards, and have a clean manual-entry fallback for prescriptions if handwriting OCR underperforms.
- **LLM cost/rate limits during repeated demo runs** — cache a known-good summary response for your demo data so a flaky API call doesn't sink the presentation.
- **Time sink on parsing edge cases** — don't try to handle every possible lab report format; pick 2–3 realistic sample formats and get those solid rather than generalizing early.
