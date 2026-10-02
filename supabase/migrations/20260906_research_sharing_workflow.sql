-- Migration: Research Evidence Sharing & Audit Log Schema with RLS
-- Date: 2026-09-06

-- 1. Create research_shares Table
CREATE TABLE IF NOT EXISTS public.research_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES public.research_evidence(id) ON DELETE CASCADE,
    university_name TEXT NOT NULL,
    industry_partner_id TEXT NOT NULL,
    industry_partner_name TEXT NOT NULL,
    shared_by TEXT NOT NULL,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
    CONSTRAINT unique_research_industry_pair UNIQUE (research_id, industry_partner_id)
);

-- 2. Create research_audit_logs Table
CREATE TABLE IF NOT EXISTS public.research_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES public.research_evidence(id) ON DELETE CASCADE,
    university_name TEXT NOT NULL,
    industry_partner_id TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action TEXT NOT NULL CHECK (action IN ('RESEARCH_SHARED', 'RESEARCH_ACCESS_REVOKED'))
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_research_shares_partner_status ON public.research_shares(industry_partner_id, status);
CREATE INDEX IF NOT EXISTS idx_research_shares_univ ON public.research_shares(university_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_research ON public.research_audit_logs(research_id);

-- 3. Enable RLS
ALTER TABLE public.research_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for research_shares
CREATE POLICY "University Owner Manage Research Shares"
ON public.research_shares FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'university' 
  AND university_name = (auth.jwt() ->> 'university_name')
);

CREATE POLICY "Industry Read Active Shares"
ON public.research_shares FOR SELECT
USING (
  (auth.jwt() ->> 'role') = 'industry'
  AND industry_partner_id = (auth.jwt() ->> 'org_name')
  AND status = 'ACTIVE'
);

-- 5. RLS Policies for research_audit_logs
CREATE POLICY "University & Admin Read Audit Logs"
ON public.research_audit_logs FOR SELECT
USING (
  ((auth.jwt() ->> 'role') = 'university' AND university_name = (auth.jwt() ->> 'university_name'))
  OR ((auth.jwt() ->> 'role') = 'admin')
);

-- 6. Storage Download Policy (Verifies ACTIVE Share Record)
CREATE POLICY "Industry Download Active Shared Storage Files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'confidential-research-vault'
  AND (auth.jwt() ->> 'role') = 'industry'
  AND EXISTS (
    SELECT 1 FROM public.research_evidence e
    JOIN public.research_shares s ON s.research_id = e.id
    WHERE s.industry_partner_id = (auth.jwt() ->> 'org_name')
    AND s.status = 'ACTIVE'
    AND e.file_path = storage.objects.name
  )
);
