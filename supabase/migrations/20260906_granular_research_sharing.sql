-- Migration: Granular Research Progress & Evidence Sharing Schema
-- Date: 2026-09-06

-- 1. Add progress_stage and progress_percentage to research_evidence table
ALTER TABLE public.research_evidence 
ADD COLUMN IF NOT EXISTS progress_stage TEXT NOT NULL DEFAULT 'PROTOTYPE' 
CHECK (progress_stage IN ('IDEA', 'RESEARCH', 'PROTOTYPE', 'TESTING', 'PILOT', 'COMPLETED')),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER NOT NULL DEFAULT 35 
CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- 2. Add shared_fields JSONB and expires_at TIMESTAMPTZ to research_shares table
ALTER TABLE public.research_shares
ADD COLUMN IF NOT EXISTS shared_fields JSONB NOT NULL DEFAULT '{
  "share_title": true,
  "share_description": true,
  "share_progress_stage": true,
  "share_metrics": true,
  "share_tech_findings": true,
  "share_demo_info": false,
  "share_paper": false,
  "share_dataset": false,
  "share_files": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Update Industry Read Active Shares RLS Policy to enforce non-expired status
DROP POLICY IF EXISTS "Industry Read Active Shares" ON public.research_shares;
CREATE POLICY "Industry Read Active Shares"
ON public.research_shares FOR SELECT
USING (
  (auth.jwt() ->> 'role') = 'industry'
  AND industry_partner_id = (auth.jwt() ->> 'org_name')
  AND status = 'ACTIVE'
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- 4. Audit Log Action Constraint Update
ALTER TABLE public.research_audit_logs 
DROP CONSTRAINT IF EXISTS research_audit_logs_action_check;

ALTER TABLE public.research_audit_logs 
ADD CONSTRAINT research_audit_logs_action_check 
CHECK (action IN ('RESEARCH_SHARED', 'RESEARCH_UPDATED', 'RESEARCH_ACCESS_REVOKED', 'FILE_UPLOADED', 'FILE_VIEWED', 'FILE_DOWNLOADED', 'FILE_ACCESS_DENIED', 'FILE_DELETED'));
