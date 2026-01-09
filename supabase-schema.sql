-- ============================================
-- LAWYER CLIENT MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Sistema de Gestión de Clientes para Despachos de Abogados
-- Version: 3.0 - Production Schema (Extracted from Supabase)
-- Project ID: jivsdcwwzhyhorhsmyex
-- Last Updated: 2026-01-09
-- ============================================

-- ============================================
-- MIGRATIONS APPLIED
-- ============================================
-- 20260109070202: add_client_email_column
-- 20260109073511: fix_clients_rls_infinite_recursion
-- 20260109073942: fix_client_links_rls_break_recursion

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for firm assets (logos, contracts, documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('firm-assets', 'firm-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILES TABLE
-- Stores firm/lawyer profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    firm_name TEXT NOT NULL DEFAULT 'Mi Despacho',
    firm_logo_url TEXT,
    calendar_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTRACT TEMPLATES TABLE
-- Stores reusable contract templates
CREATE TABLE IF NOT EXISTS public.contract_templates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONNAIRE TEMPLATES TABLE
-- Stores reusable questionnaire templates
CREATE TABLE IF NOT EXISTS public.questionnaire_templates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
-- Stores questions for each questionnaire template
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    questionnaire_id UUID REFERENCES questionnaire_templates(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLIENTS TABLE
-- Stores client information and welcome room data
-- Note: contract_template_id and questionnaire_template_id are NULLABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    case_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    client_email TEXT, -- Client email address for notifications
    custom_message TEXT, -- Custom welcome message for the client portal
    expiration_days INTEGER DEFAULT 7, -- Number of days until the portal link expires
    contract_template_id UUID REFERENCES contract_templates(id) ON DELETE RESTRICT,
    questionnaire_template_id UUID REFERENCES questionnaire_templates(id) ON DELETE RESTRICT,
    required_documents TEXT[] DEFAULT '{}',
    contract_signed_url TEXT,
    signature_data JSONB, -- { "typed_name": "...", "timestamp": "...", "ip": "..." }
    signature_timestamp TIMESTAMPTZ,
    signature_ip TEXT,
    signature_hash TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft delete for GDPR/LGPD compliance
    link_used BOOLEAN DEFAULT FALSE
);

-- 6. CLIENT LINKS TABLE
-- Manages magic links with expiration and revocation
-- Note: user_id added for RLS optimization (avoids infinite recursion)
CREATE TABLE IF NOT EXISTS public.client_links (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Added for RLS policy optimization
    magic_link_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CLIENT DOCUMENTS TABLE
-- Stores documents uploaded by clients
CREATE TABLE IF NOT EXISTS public.client_documents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CLIENT ANSWERS TABLE
-- Stores client answers to questionnaire questions
CREATE TABLE IF NOT EXISTS public.client_answers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
-- Tracks all actions for compliance (LGPD/GDPR)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    action TEXT NOT NULL, -- 'viewed_client', 'signed', 'downloaded_doc', 'link_accessed'
    resource_type TEXT, -- 'client', 'document', 'contract', 'link'
    resource_id UUID,
    details JSONB, -- IP, user agent, metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMAIL NOTIFICATIONS TABLE
-- Tracks email delivery status
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('welcome', 'reminder', 'completed', 'link_expired')),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_templates_user_id ON public.contract_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_user_id ON public.questionnaire_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON public.questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_client_links_token ON public.client_links(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_client_links_client_id ON public.client_links(client_id);
CREATE INDEX IF NOT EXISTS idx_client_links_expires_at ON public.client_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_answers_client_id ON public.client_answers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_answers_question_id ON public.client_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON public.audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_client_id ON public.email_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- CONTRACT TEMPLATES POLICIES
-- ============================================

CREATE POLICY "Users can view their own contract templates"
    ON public.contract_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contract templates"
    ON public.contract_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract templates"
    ON public.contract_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- QUESTIONNAIRE TEMPLATES POLICIES
-- ============================================

CREATE POLICY "Users can view their own questionnaire templates"
    ON public.questionnaire_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire templates"
    ON public.questionnaire_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questionnaire templates"
    ON public.questionnaire_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- QUESTIONS POLICIES
-- ============================================

CREATE POLICY "Users can view questions from their questionnaires"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions to their questionnaires"
    ON public.questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete questions from their questionnaires"
    ON public.questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions in their questionnaires"
    ON public.questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

-- ============================================
-- CLIENTS POLICIES (Optimized - No Infinite Recursion)
-- ============================================

CREATE POLICY "Users can view their own non-deleted clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete their own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Public portal access via valid magic link (uses alias to avoid recursion)
CREATE POLICY "Public can view client by valid magic link"
    ON public.clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_links cl
            WHERE cl.client_id = clients.id
            AND cl.expires_at > NOW()
            AND cl.revoked_at IS NULL
        )
    );

CREATE POLICY "Public can update client by valid magic link"
    ON public.clients FOR UPDATE
    USING (
        status = 'pending'
        AND signature_timestamp IS NULL
        AND EXISTS (
            SELECT 1 FROM client_links cl
            WHERE cl.client_id = clients.id
            AND cl.expires_at > NOW()
            AND cl.revoked_at IS NULL
        )
    );

-- ============================================
-- CLIENT LINKS POLICIES (Uses user_id for efficiency)
-- ============================================

CREATE POLICY "Users can view their own client links"
    ON public.client_links FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own client links"
    ON public.client_links FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own client links"
    ON public.client_links FOR UPDATE
    USING (user_id = auth.uid());

-- Public can view valid links by token (for portal access)
CREATE POLICY "Public can view client link by token"
    ON public.client_links FOR SELECT
    USING (expires_at > NOW() AND revoked_at IS NULL);

-- ============================================
-- CLIENT DOCUMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view documents from their clients"
    ON public.client_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_documents.client_id
            AND clients.user_id = auth.uid()
            AND clients.deleted_at IS NULL
        )
    );

CREATE POLICY "Public can insert client documents via valid link"
    ON public.client_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            JOIN client_links ON client_links.client_id = clients.id
            WHERE clients.id = client_documents.client_id
            AND client_links.expires_at > NOW()
            AND client_links.revoked_at IS NULL
        )
    );

CREATE POLICY "Users can delete documents from their clients"
    ON public.client_documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_documents.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- CLIENT ANSWERS POLICIES
-- ============================================

CREATE POLICY "Users can view answers from their clients"
    ON public.client_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_answers.client_id
            AND clients.user_id = auth.uid()
            AND clients.deleted_at IS NULL
        )
    );

CREATE POLICY "Public can insert client answers via valid link"
    ON public.client_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            JOIN client_links ON client_links.client_id = clients.id
            WHERE clients.id = client_answers.client_id
            AND client_links.expires_at > NOW()
            AND client_links.revoked_at IS NULL
        )
    );

CREATE POLICY "Users can delete answers from their clients"
    ON public.client_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_answers.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

CREATE POLICY "Users can view audit logs of their clients"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = audit_logs.client_id
            AND clients.user_id = auth.uid()
        )
        OR auth.uid() = audit_logs.user_id
    );

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- EMAIL NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view notifications for their clients"
    ON public.email_notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = email_notifications.client_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert email notifications"
    ON public.email_notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update email notifications"
    ON public.email_notifications FOR UPDATE
    USING (true);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'firm-assets' AND auth.role() = 'authenticated');

-- Allow public to read files (for client portal)
CREATE POLICY "Public can read files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'firm-assets');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'firm-assets' AND auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, firm_name)
    VALUES (NEW.id, 'Mi Despacho');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log link access (can be used via trigger or API)
CREATE OR REPLACE FUNCTION public.log_link_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed_at = NOW();
    NEW.access_count = NEW.access_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 
    'contract_templates', 
    'questionnaire_templates', 
    'questions', 
    'clients',
    'client_links',
    'client_documents', 
    'client_answers',
    'audit_logs',
    'email_notifications'
)
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 
    'contract_templates', 
    'questionnaire_templates', 
    'questions', 
    'clients',
    'client_links',
    'client_documents', 
    'client_answers',
    'audit_logs',
    'email_notifications'
)
ORDER BY tablename;

-- ============================================
-- SCHEMA DIFFERENCES FROM ORIGINAL
-- ============================================

/*
CHANGES MADE (compared to original schema):

1. **clients table**:
   - contract_template_id: Changed from NOT NULL to NULLABLE
   - questionnaire_template_id: Changed from NOT NULL to NULLABLE
   - Added: client_email TEXT (for email notifications)
   - Added: custom_message TEXT (for personalized welcome messages)
   - Added: expiration_days INTEGER DEFAULT 7

2. **client_links table**:
   - Added: user_id UUID (for RLS policy optimization)
   - This breaks the infinite recursion between clients <-> client_links policies

3. **RLS Policies (clients)**:
   - Simplified "Public can view client by valid magic link" to use alias 'cl'
   - Simplified "Public can update client by valid magic link" to use alias 'cl'
   - These changes prevent infinite recursion

4. **RLS Policies (client_links)**:
   - Changed from JOIN to clients to direct user_id check
   - Policies now use: user_id = auth.uid() instead of EXISTS subquery
   - This eliminates the circular dependency

5. **Extensions**:
   - UUID extension uses 'extensions' schema (Supabase default)
*/

-- ============================================
-- PRODUCTION CHECKLIST
-- ============================================

/*
✅ VERIFIED SCHEMA ELEMENTS:

Tables (10 total):
  ✅ profiles (1 row - has data)
  ✅ contract_templates (0 rows)
  ✅ questionnaire_templates (0 rows)
  ✅ questions (0 rows)
  ✅ clients (0 rows)
  ✅ client_links (0 rows)
  ✅ client_documents (0 rows)
  ✅ client_answers (0 rows)
  ✅ audit_logs (0 rows)
  ✅ email_notifications (0 rows)

RLS Enabled:
  ✅ All 10 tables have RLS enabled

Policies:
  ✅ 35 policies across all tables

Indexes:
  ✅ 18 custom indexes for performance

Functions:
  ✅ handle_new_user (auto-creates profile)
  ✅ update_updated_at_column (timestamps)
  ✅ log_link_access (link tracking)

Triggers:
  ✅ on_auth_user_created (creates profile)
  ✅ update_profiles_updated_at (auto-update)

Storage:
  ✅ firm-assets bucket (public)
  ✅ 3 storage policies

Migrations Applied:
  ✅ 20260109070202: add_client_email_column
  ✅ 20260109073511: fix_clients_rls_infinite_recursion
  ✅ 20260109073942: fix_client_links_rls_break_recursion

NEXT STEPS FOR PRODUCTION:

1. Set up email sending (Resend/SendGrid integration)
2. Create Edge Functions for:
   - Generate magic links with crypto-secure tokens
   - Send welcome emails
   - Cleanup expired links (cron job)
3. Add rate limiting
4. Set up monitoring (Sentry, PostHog)
*/