-- ==============================================================================
-- HealthVault 2.0 Schema Migration
-- Doctor Portal, Family Health, Granular Permissions, Doctor Reviews, and Chat
-- ==============================================================================

-- 1. Ensure profiles table has account_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'account_type'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN account_type TEXT NOT NULL DEFAULT 'patient' 
        CHECK (account_type IN ('patient', 'doctor'));
    END IF;
END $$;

-- 2. Doctor Profiles Table
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT NOT NULL,
    medical_registration_number TEXT NOT NULL,
    registration_country TEXT NOT NULL DEFAULT 'India',
    clinic_name TEXT NOT NULL,
    clinic_address TEXT,
    years_of_experience INTEGER NOT NULL DEFAULT 1,
    bio TEXT,
    profile_photo_path TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for doctor profile lookups
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verification ON public.doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_spec ON public.doctor_profiles(specialization);

-- 3. Doctor-Patient Relationships Table
CREATE TABLE IF NOT EXISTS public.doctor_patient_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT unique_doctor_patient_pair UNIQUE (doctor_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_dpr_doctor_id ON public.doctor_patient_relationships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_dpr_patient_id ON public.doctor_patient_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_dpr_status ON public.doctor_patient_relationships(status);

-- 4. Doctor Access Permissions Table (Privacy-First Granular Matrix)
CREATE TABLE IF NOT EXISTS public.doctor_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID UNIQUE NOT NULL REFERENCES public.doctor_patient_relationships(id) ON DELETE CASCADE,
    share_summary BOOLEAN NOT NULL DEFAULT true,
    share_labs BOOLEAN NOT NULL DEFAULT false,
    share_prescriptions BOOLEAN NOT NULL DEFAULT false,
    share_vaccinations BOOLEAN NOT NULL DEFAULT false,
    share_original_documents BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dap_relationship_id ON public.doctor_access_permissions(relationship_id);

-- 5. Doctor Reviews Table (Blue Star Provenance tied to specific summary_id)
CREATE TABLE IF NOT EXISTS public.doctor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary_id UUID NOT NULL REFERENCES public.summaries(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'reviewed' CHECK (status IN ('reviewed', 'draft', 'archived')),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_reviews_summary_id ON public.doctor_reviews(summary_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON public.doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_patient_id ON public.doctor_reviews(patient_id);

-- 6. Family Relationships Table
CREATE TABLE IF NOT EXISTS public.family_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_family_owner_id ON public.family_relationships(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_family_member_id ON public.family_relationships(member_user_id);

-- 7. Family Access Permissions Table
CREATE TABLE IF NOT EXISTS public.family_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_relationship_id UUID UNIQUE NOT NULL REFERENCES public.family_relationships(id) ON DELETE CASCADE,
    share_summary BOOLEAN NOT NULL DEFAULT false,
    share_labs BOOLEAN NOT NULL DEFAULT false,
    share_prescriptions BOOLEAN NOT NULL DEFAULT false,
    share_vaccinations BOOLEAN NOT NULL DEFAULT false,
    share_flags BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fap_relationship_id ON public.family_access_permissions(family_relationship_id);

-- 8. Conversations Table (1-to-1 between Patient & Doctor)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_conversation_participants UNIQUE (patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_doctor ON public.conversations(doctor_id);

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    shared_summary_id UUID REFERENCES public.summaries(id) ON DELETE SET NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'doctor_request', 
        'doctor_request_accepted', 
        'doctor_request_declined', 
        'new_message', 
        'doctor_review', 
        'summary_shared', 
        'family_request', 
        'family_request_accepted'
    )),
    title TEXT NOT NULL,
    body TEXT,
    related_id UUID,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- 11. Audit Access Logs Table
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_patient ON public.access_logs(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_actor ON public.access_logs(actor_user_id);

-- 12. Automated Trigger for doctor_patient_relationships to create default permissions
CREATE OR REPLACE FUNCTION public.handle_new_doctor_relationship()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.doctor_access_permissions (relationship_id, share_summary, share_labs, share_prescriptions, share_vaccinations, share_original_documents)
    VALUES (NEW.id, true, false, false, false, false)
    ON CONFLICT (relationship_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_doctor_relationship ON public.doctor_patient_relationships;
CREATE TRIGGER trg_new_doctor_relationship
    AFTER INSERT ON public.doctor_patient_relationships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_doctor_relationship();

-- 13. Automated Trigger for family_relationships to create default permissions
CREATE OR REPLACE FUNCTION public.handle_new_family_relationship()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.family_access_permissions (family_relationship_id, share_summary, share_labs, share_prescriptions, share_vaccinations, share_flags)
    VALUES (NEW.id, false, false, false, false, false)
    ON CONFLICT (family_relationship_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_family_relationship ON public.family_relationships;
CREATE TRIGGER trg_new_family_relationship
    AFTER INSERT ON public.family_relationships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_family_relationship();

-- 14. Enable Row-Level Security (RLS) on all new tables
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies

-- Doctor Profiles: Verified profiles are discoverable by any authenticated user; own profile can be managed by owner.
DROP POLICY IF EXISTS "doctor_profiles_select_verified" ON public.doctor_profiles;
CREATE POLICY "doctor_profiles_select_verified" ON public.doctor_profiles
    FOR SELECT TO authenticated
    USING (verification_status = 'verified' OR (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "doctor_profiles_manage_own" ON public.doctor_profiles;
CREATE POLICY "doctor_profiles_manage_own" ON public.doctor_profiles
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Doctor Patient Relationships: Visible to the doctor or patient involved
DROP POLICY IF EXISTS "dpr_select" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_select" ON public.doctor_patient_relationships
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = doctor_id OR (SELECT auth.uid()) = patient_id);

DROP POLICY IF EXISTS "dpr_insert" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_insert" ON public.doctor_patient_relationships
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = requested_by AND ((SELECT auth.uid()) = doctor_id OR (SELECT auth.uid()) = patient_id));

DROP POLICY IF EXISTS "dpr_update" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_update" ON public.doctor_patient_relationships
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = doctor_id OR (SELECT auth.uid()) = patient_id)
    WITH CHECK ((SELECT auth.uid()) = doctor_id OR (SELECT auth.uid()) = patient_id);

-- Doctor Access Permissions: Patient controls, doctor reads
DROP POLICY IF EXISTS "dap_select" ON public.doctor_access_permissions;
CREATE POLICY "dap_select" ON public.doctor_access_permissions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.doctor_patient_relationships r
            WHERE r.id = relationship_id 
            AND (r.doctor_id = (SELECT auth.uid()) OR r.patient_id = (SELECT auth.uid()))
        )
    );

DROP POLICY IF EXISTS "dap_update" ON public.doctor_access_permissions;
CREATE POLICY "dap_update" ON public.doctor_access_permissions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.doctor_patient_relationships r
            WHERE r.id = relationship_id AND r.patient_id = (SELECT auth.uid())
        )
    );

-- Doctor Reviews: Visible to patient and doctor; Insertable ONLY by verified doctor with accepted relationship
DROP POLICY IF EXISTS "reviews_select" ON public.doctor_reviews;
CREATE POLICY "reviews_select" ON public.doctor_reviews
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = patient_id OR (SELECT auth.uid()) = doctor_id);

DROP POLICY IF EXISTS "reviews_insert" ON public.doctor_reviews;
CREATE POLICY "reviews_insert" ON public.doctor_reviews
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = doctor_id
        AND EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.user_id = (SELECT auth.uid()) AND dp.verification_status = 'verified'
        )
        AND EXISTS (
            SELECT 1 FROM public.doctor_patient_relationships r
            JOIN public.doctor_access_permissions p ON p.relationship_id = r.id
            WHERE r.doctor_id = (SELECT auth.uid()) 
            AND r.patient_id = doctor_reviews.patient_id 
            AND r.status = 'accepted'
            AND p.share_summary = true
        )
    );

-- Family Relationships: Visible to owner or invited member
DROP POLICY IF EXISTS "family_rel_select" ON public.family_relationships;
CREATE POLICY "family_rel_select" ON public.family_relationships
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = owner_user_id OR (SELECT auth.uid()) = member_user_id);

DROP POLICY IF EXISTS "family_rel_insert" ON public.family_relationships;
CREATE POLICY "family_rel_insert" ON public.family_relationships
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = owner_user_id);

DROP POLICY IF EXISTS "family_rel_update" ON public.family_relationships;
CREATE POLICY "family_rel_update" ON public.family_relationships
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = owner_user_id OR (SELECT auth.uid()) = member_user_id);

-- Family Access Permissions
DROP POLICY IF EXISTS "family_perm_select" ON public.family_access_permissions;
CREATE POLICY "family_perm_select" ON public.family_access_permissions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.family_relationships fr
            WHERE fr.id = family_relationship_id 
            AND (fr.owner_user_id = (SELECT auth.uid()) OR fr.member_user_id = (SELECT auth.uid()))
        )
    );

DROP POLICY IF EXISTS "family_perm_update" ON public.family_access_permissions;
CREATE POLICY "family_perm_update" ON public.family_access_permissions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.family_relationships fr
            WHERE fr.id = family_relationship_id 
            AND (fr.member_user_id = (SELECT auth.uid()) OR (fr.member_user_id IS NULL AND fr.owner_user_id = (SELECT auth.uid())))
        )
    );

-- Conversations
DROP POLICY IF EXISTS "conversations_access" ON public.conversations;
CREATE POLICY "conversations_access" ON public.conversations
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = patient_id OR (SELECT auth.uid()) = doctor_id)
    WITH CHECK ((SELECT auth.uid()) = patient_id OR (SELECT auth.uid()) = doctor_id);

-- Messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id 
            AND (c.patient_id = (SELECT auth.uid()) OR c.doctor_id = (SELECT auth.uid()))
        )
    );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id 
            AND (c.patient_id = (SELECT auth.uid()) OR c.doctor_id = (SELECT auth.uid()))
        )
    );

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id 
            AND (c.patient_id = (SELECT auth.uid()) OR c.doctor_id = (SELECT auth.uid()))
        )
    );

-- Notifications
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Access Logs
DROP POLICY IF EXISTS "access_logs_select" ON public.access_logs;
CREATE POLICY "access_logs_select" ON public.access_logs
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = patient_user_id OR (SELECT auth.uid()) = actor_user_id);

DROP POLICY IF EXISTS "access_logs_insert" ON public.access_logs;
CREATE POLICY "access_logs_insert" ON public.access_logs
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = actor_user_id);
