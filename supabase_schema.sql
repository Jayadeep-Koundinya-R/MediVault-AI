-- ==============================================================================
-- MediVault AI — Complete Supabase PostgreSQL Production DDL Schema
-- Hackathon / Production Database Architecture with Row Level Security (RLS)
-- Copy and paste this directly into your Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. USERS & PATIENT PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL, -- auth.users foreign key or custom user ID
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    relationship TEXT DEFAULT 'self' CHECK (relationship IN ('self', 'mother', 'father', 'child', 'spouse')),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group TEXT DEFAULT 'B+',
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact TEXT,
    dpdp_consent_granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. MEDICAL DOCUMENTS (Raw Scans & OCR Processing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('prescription', 'lab_report', 'vaccination')),
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'success', 'low_confidence', 'failed')),
    confidence_score NUMERIC(5,2) DEFAULT 0.0,
    raw_ocr_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PRESCRIPTIONS (Extracted Medication Regimens)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id TEXT UNIQUE NOT NULL,
    document_id TEXT REFERENCES public.documents(document_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    drug_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    prescribed_date DATE NOT NULL,
    prescribing_doctor TEXT,
    source_hospital TEXT,
    manually_corrected BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. LAB RESULTS (Individual Biomarker Readings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_result_id TEXT UNIQUE NOT NULL,
    document_id TEXT REFERENCES public.documents(document_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    reference_range_low NUMERIC(10,2),
    reference_range_high NUMERIC(10,2),
    test_date DATE NOT NULL,
    source_lab TEXT,
    manually_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. VACCINATIONS (Immunization Certificates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vaccination_id TEXT UNIQUE NOT NULL,
    document_id TEXT REFERENCES public.documents(document_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    dose_number INT DEFAULT 1,
    date_administered DATE NOT NULL,
    facility TEXT,
    next_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. AI SUMMARIES (Longitudinal Patient Syntheses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    summary_text TEXT NOT NULL,
    source_lab_result_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    source_prescription_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    trend_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    language TEXT DEFAULT 'en'
);

-- ------------------------------------------------------------------------------
-- 8. CLINICAL RISK FLAGS (ADA/WHO Guideline Thresholds)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    lab_result_id TEXT REFERENCES public.lab_results(lab_result_id) ON DELETE CASCADE,
    rule_triggered TEXT NOT NULL,
    threshold_description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'moderate', 'high')),
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------------------------
-- 9. DOCTORS DIRECTORY (Family Doctors & MediVault Partner Specialists)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital TEXT NOT NULL,
    license_number TEXT NOT NULL,
    experience_years INT DEFAULT 5,
    rating NUMERIC(3,2) DEFAULT 4.9,
    review_count INT DEFAULT 120,
    consultation_fee NUMERIC(8,2) DEFAULT 499.00,
    is_partner BOOLEAN DEFAULT TRUE,
    available_now BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. DOCTOR CONSULTATIONS (Human-in-the-Loop Review Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting_review' CHECK (status IN ('waiting_review', 'in_consultation', 'completed')),
    urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('high', 'moderate', 'routine')),
    flagged_summary TEXT NOT NULL,
    related_document_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    triage_responses JSONB DEFAULT '[]'::JSONB,
    doctor_clinical_note TEXT,
    recommended_follow_up_date DATE,
    negotiated_plan TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 11. CONSULTATION MESSAGES (Real-time Doctor-Patient Chat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id TEXT UNIQUE NOT NULL,
    consultation_id TEXT REFERENCES public.consultations(consultation_id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('patient', 'doctor', 'system')),
    text TEXT NOT NULL,
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. AUTOMATED NOTIFICATIONS & RETENTION TRIGGERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow_up', 'risk_flag', 'medicine_reminder', 'vaccine_due', 'inactivity', 'doctor_message')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. MONETIZATION & SUBSCRIPTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'patient_pro', 'family_vault', 'pay_per_consult')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read/write during demo / development mode
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read on documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on documents" ON public.documents FOR ALL USING (true);

CREATE POLICY "Allow public read on prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on prescriptions" ON public.prescriptions FOR ALL USING (true);

CREATE POLICY "Allow public read on lab_results" ON public.lab_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on lab_results" ON public.lab_results FOR ALL USING (true);

CREATE POLICY "Allow public read on vaccinations" ON public.vaccinations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on vaccinations" ON public.vaccinations FOR ALL USING (true);

CREATE POLICY "Allow public read on ai_summaries" ON public.ai_summaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on ai_summaries" ON public.ai_summaries FOR ALL USING (true);

CREATE POLICY "Allow public read on risk_flags" ON public.risk_flags FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on risk_flags" ON public.risk_flags FOR ALL USING (true);

CREATE POLICY "Allow public read on doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on doctors" ON public.doctors FOR ALL USING (true);

CREATE POLICY "Allow public read on consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on consultations" ON public.consultations FOR ALL USING (true);

CREATE POLICY "Allow public read on messages" ON public.consultation_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on messages" ON public.consultation_messages FOR ALL USING (true);

CREATE POLICY "Allow public read on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Allow public read on subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on subscriptions" ON public.subscriptions FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 15. SEED DATA (Ready for Immediate Demonstration)
-- ------------------------------------------------------------------------------

-- Seed Patients
INSERT INTO public.profiles (user_id, name, date_of_birth, relationship, gender, blood_group, allergies, emergency_contact)
VALUES 
('usr_rahul_992', 'Rahul Sharma', '1984-06-12', 'self', 'Male', 'B+', ARRAY['Penicillin (mild rash)'], '+91 98450 12345 (Priya - Wife)'),
('usr_sunita_412', 'Sunita Sharma', '1956-02-18', 'mother', 'Female', 'O+', ARRAY['Sulfa drugs'], '+91 98450 12345 (Son - Rahul)'),
('usr_aarav_881', 'Aarav Sharma', '2014-11-05', 'child', 'Male', 'B+', ARRAY['Peanuts'], '+91 98450 12345 (Father - Rahul)')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Partner Doctors
INSERT INTO public.doctors (doctor_id, name, specialty, hospital, license_number, experience_years, rating, review_count, consultation_fee, is_partner, available_now, bio)
VALUES
('doc_ananya_sen', 'Dr. Ananya Sen, MD, DM', 'Endocrinologist & Diabetologist', 'Apollo Health City, Hyderabad', 'MCI-2011/04/1829', 14, 4.96, 248, 599.00, true, true, 'Senior Consultant in Endocrinology specializing in early Type 2 Diabetes intervention and metabolic disorders.'),
('doc_arvind_rao', 'Dr. Arvind Rao, MD, DNB', 'Cardiologist & Vascular Specialist', 'Fortis Escorts Heart Institute', 'MCI-2008/11/4921', 18, 4.92, 310, 699.00, true, true, 'Specializes in preventative lipidology, hypertension management, and cardiovascular risk reduction.'),
('doc_rajesh_gupta', 'Dr. Rajesh Gupta, MBBS, MD', 'Senior General Physician', 'Max Super Speciality Hospital', 'DMC-2005/02/1042', 20, 4.88, 412, 449.00, true, true, 'Family medicine specialist with 20+ years experience in chronic care management across multi-specialty hospitals.'),
('doc_family_sharma', 'Dr. K. S. Murthy, MD', 'Family Physician (Invited)', 'Murthy Family Clinic, Bengaluru', 'KMC-1998/09/2144', 25, 5.00, 48, 350.00, false, true, 'Rahul Sharma''s designated family physician for over 12 years.')
ON CONFLICT (doctor_id) DO NOTHING;

-- Seed Initial Consultation in Review Queue
INSERT INTO public.consultations (consultation_id, user_id, doctor_id, status, urgency, flagged_summary, triage_responses, doctor_clinical_note, recommended_follow_up_date, negotiated_plan)
VALUES
('cons_001_glucose', 'usr_rahul_992', 'doc_ananya_sen', 'in_consultation', 'high', 'Patient Fasting Blood Glucose is 138 mg/dL and HbA1c is 7.1% (ADA Diabetic Threshold >= 126 mg/dL). Elevated from 112 mg/dL over 8 months.', 
'[{"question": "Are you experiencing increased thirst or urination?", "answer": "Yes, especially noticeable at night over the last 3 weeks."}, {"question": "Any family history of diabetes?", "answer": "Yes, mother has Type 2 diabetes managed on medication."}, {"question": "Current daily exercise?", "answer": "Sedentary desk job, walking 20 mins occasionally."}]'::JSONB,
'Verified lab results against Apollo Hospital biochemistry report. Commencing Tab. Metformin 500mg BID and Glimepiride 1mg OD. Lifestyle modification advised.',
'2026-09-24',
'Start Metformin with meals. Follow 45 min brisk walking daily. Review fasting blood glucose in 4 weeks.')
ON CONFLICT (consultation_id) DO NOTHING;

-- Seed Chat Messages for the Consultation
INSERT INTO public.consultation_messages (message_id, consultation_id, sender, text, created_at)
VALUES
('msg_001', 'cons_001_glucose', 'system', 'Consultation opened. AI health summary and original hospital records linked for Dr. Ananya Sen.', '2026-08-21T14:15:00Z'),
('msg_002', 'cons_001_glucose', 'doctor', 'Hello Rahul, I have reviewed your Apollo biochemistry report and previous tests from Fortis. Your fasting blood sugar of 138 mg/dL alongside HbA1c at 7.1% confirms Type 2 Diabetes.', '2026-08-21T14:16:30Z'),
('msg_003', 'cons_001_glucose', 'patient', 'Thank you Dr. Ananya. Is this reversible with diet alone or do I need medications right away?', '2026-08-21T14:18:00Z'),
('msg_004', 'cons_001_glucose', 'doctor', 'Given the HbA1c of 7.1%, starting Metformin 500mg twice daily with meals will protect your beta-cell function. Combined with a low-glycemic diet and daily walking, we can aim to bring your HbA1c below 6.5%.', '2026-08-21T14:20:15Z'),
('msg_005', 'cons_001_glucose', 'patient', 'Understood doctor. How soon should we do a follow-up test?', '2026-08-21T14:21:45Z'),
('msg_006', 'cons_001_glucose', 'doctor', 'Let us schedule a review fasting blood glucose check in 4 weeks (around September 24th). I have set a reminder in your MediVault calendar.', '2026-08-21T14:23:00Z')
ON CONFLICT (message_id) DO NOTHING;

-- Seed Active Notifications for the 6 Core Triggers
INSERT INTO public.notifications (notification_id, user_id, type, title, body, read, action_url)
VALUES
('notif_001', 'usr_rahul_992', 'follow_up', 'Upcoming Doctor Follow-up Checkup', 'Dr. Ananya Sen recommended a review fasting glucose test on 24th Sept. Tap to prepare.', false, '/consultations'),
('notif_002', 'usr_rahul_992', 'risk_flag', 'Clinical Flag: Fasting Glucose 138 mg/dL', 'Your recent Apollo report triggered ADA diabetes threshold. In review with Dr. Ananya Sen.', false, '/labs'),
('notif_003', 'usr_rahul_992', 'medicine_reminder', 'Evening Medication Reminder', 'Time for Tab. Metformin 500mg with dinner. Tap to log dose as taken.', false, '/prescriptions'),
('notif_004', 'usr_rahul_992', 'vaccine_due', 'Family Vaccine Reminder (Aarav)', 'Aarav''s annual Influenza vaccine booster is due this month. Check immunization card.', false, '/vaccinations'),
('notif_005', 'usr_rahul_992', 'inactivity', 'Quarterly Health Vault Check', 'No new records uploaded in 60 days. Scan your latest prescription or blood test to keep trends current.', false, '/dashboard'),
('notif_006', 'usr_rahul_992', 'doctor_message', 'Dr. Ananya Sen sent you a message', 'New consultation note regarding your Metformin dosage schedule.', false, '/consultations')
ON CONFLICT (notification_id) DO NOTHING;

-- Seed Subscriptions
INSERT INTO public.subscriptions (user_id, plan_id, status)
VALUES ('usr_rahul_992', 'family_vault', 'active')
ON CONFLICT DO NOTHING;
