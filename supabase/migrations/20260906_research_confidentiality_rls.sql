-- Migration: Research Progress & Evidence Confidentiality RLS & Storage Policies
-- Date: 2026-09-06

-- 1. Create research_evidence Table
CREATE TABLE IF NOT EXISTS public.research_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    university_name TEXT NOT NULL,
    title TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('lab_report', 'paper_draft', 'dataset', 'prototype_video', 'field_trial')),
    description TEXT NOT NULL,
    file_path TEXT,
    external_url TEXT,
    metrics_summary TEXT,
    sharing_state TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (sharing_state IN ('PRIVATE', 'SHARED_WITH_INDUSTRY')),
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('submitted', 'under_review', 'verified')),
    verified_by_faculty BOOLEAN NOT NULL DEFAULT FALSE,
    faculty_notes TEXT,
    submitted_by TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create research_evidence_shares Junction Table for Explicit Industry Partner Sharing
CREATE TABLE IF NOT EXISTS public.research_evidence_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES public.research_evidence(id) ON DELETE CASCADE,
    industry_partner_id TEXT NOT NULL,
    shared_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_evidence_industry_share UNIQUE (evidence_id, industry_partner_id)
);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_research_evidence_univ ON public.research_evidence(university_name);
CREATE INDEX IF NOT EXISTS idx_research_evidence_team ON public.research_evidence(team_id);
CREATE INDEX IF NOT EXISTS idx_research_evidence_state ON public.research_evidence(sharing_state);
CREATE INDEX IF NOT EXISTS idx_evidence_shares_partner ON public.research_evidence_shares(industry_partner_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.research_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_evidence_shares ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for research_evidence Table

-- Policy A: University Owner Full Access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "University Owner Full Access"
ON public.research_evidence
FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'university' 
  AND university_name = (auth.jwt() ->> 'university_name')
);

-- Policy B: Explicit Industry Partner Read-Only Access (SELECT ONLY)
CREATE POLICY "Industry Explicit Share Read-Only"
ON public.research_evidence
FOR SELECT
USING (
  sharing_state = 'SHARED_WITH_INDUSTRY'
  AND (auth.jwt() ->> 'role') = 'industry'
  AND EXISTS (
    SELECT 1 FROM public.research_evidence_shares s
    WHERE s.evidence_id = public.research_evidence.id
    AND s.industry_partner_id = (auth.jwt() ->> 'org_name')
  )
);

-- Policy C: System Admin Oversight (SELECT ONLY)
CREATE POLICY "Admin Oversight Read-Only"
ON public.research_evidence
FOR SELECT
USING ((auth.jwt() ->> 'role') = 'admin');

-- 5. RLS Policies for research_evidence_shares Table

-- Policy A: University Owner Share Management
CREATE POLICY "University Owner Manage Shares"
ON public.research_evidence_shares
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.research_evidence e
    WHERE e.id = public.research_evidence_shares.evidence_id
    AND e.university_name = (auth.jwt() ->> 'university_name')
  )
);

-- Policy B: Industry Read Own Shares
CREATE POLICY "Industry Read Shares"
ON public.research_evidence_shares
FOR SELECT
USING (industry_partner_id = (auth.jwt() ->> 'org_name'));

-- 6. Supabase Private Storage Bucket Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('confidential-research-vault', 'confidential-research-vault', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy A: University Owner Full Control over Path /{university_name}/*
CREATE POLICY "University Owner Storage Access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'confidential-research-vault'
  AND (auth.jwt() ->> 'role') = 'university'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'university_name')
);

-- Storage Policy B: Industry Shared Read-Only Object Download
CREATE POLICY "Industry Shared Storage Read-Only"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'confidential-research-vault'
  AND (auth.jwt() ->> 'role') = 'industry'
  AND EXISTS (
    SELECT 1 FROM public.research_evidence e
    JOIN public.research_evidence_shares s ON s.evidence_id = e.id
    WHERE s.industry_partner_id = (auth.jwt() ->> 'org_name')
    AND e.sharing_state = 'SHARED_WITH_INDUSTRY'
    AND e.file_path = name
  )
);
