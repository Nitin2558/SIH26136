-- ============================================================================
-- STEP 5 — SUPABASE STORAGE & DATABASE MIGRATION FOR RESEARCH EVIDENCE FILES
-- ============================================================================

-- 1. Create research_evidence_files table
CREATE TABLE IF NOT EXISTS public.research_evidence_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id TEXT NOT NULL,
  university_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast access
CREATE INDEX IF NOT EXISTS idx_research_files_research_id ON public.research_evidence_files(research_id);
CREATE INDEX IF NOT EXISTS idx_research_files_univ ON public.research_evidence_files(university_id);

-- Enable RLS on research_evidence_files
ALTER TABLE public.research_evidence_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: University Owner Full Access (SELECT, INSERT, DELETE)
CREATE POLICY "University Owner Research Files Access"
  ON public.research_evidence_files
  FOR ALL
  TO authenticated
  USING (
    university_id = (auth.jwt() ->> 'university_name') OR
    university_id = (auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    university_id = (auth.jwt() ->> 'university_name') OR
    university_id = (auth.jwt() ->> 'sub')
  );

-- RLS Policy 2: Shared Industry Read-Only Access
CREATE POLICY "Industry Shared Research Files Read Only"
  ON public.research_evidence_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.research_shares rs
      WHERE rs.research_id = public.research_evidence_files.research_id
        AND (rs.industry_partner_id = (auth.jwt() ->> 'org_name') OR rs.industry_partner_id = (auth.jwt() ->> 'sub'))
        AND rs.status = 'ACTIVE'
    )
  );

-- RLS Policy 3: Deny Write/Update/Delete to Industry, Citizens, and Public
CREATE POLICY "Deny Unauthorized Files Modifications"
  ON public.research_evidence_files
  FOR INSERT UPDATE DELETE
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'university' OR
    (auth.jwt() ->> 'role') = 'admin'
  );

-- ============================================================================
-- 2. PRIVATE STORAGE BUCKET: research-evidence (STRICTLY PRIVATE)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-evidence',
  'research-evidence',
  FALSE, -- PRIVATE BUCKET (NO PUBLIC ACCESS)
  104857600, -- 100MB Max File Size Limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

-- Storage RLS Policy 1: University Owner Read/Write/Delete Objects
CREATE POLICY "University Storage Owner Access"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'research-evidence' AND
    (
      (auth.jwt() ->> 'role') = 'university' OR
      (auth.jwt() ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'research-evidence' AND
    (
      (auth.jwt() ->> 'role') = 'university' OR
      (auth.jwt() ->> 'role') = 'admin'
    )
  );

-- Storage RLS Policy 2: Shared Industry Partner Read-Only Downloads
CREATE POLICY "Shared Industry Partner Storage Read Access"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'research-evidence' AND
    EXISTS (
      SELECT 1 FROM public.research_shares rs
      JOIN public.research_evidence_files ref ON ref.research_id = rs.research_id
      WHERE ref.storage_path = name
        AND (rs.industry_partner_id = (auth.jwt() ->> 'org_name') OR rs.industry_partner_id = (auth.jwt() ->> 'sub'))
        AND rs.status = 'ACTIVE'
    )
  );
