-- Run this in Supabase SQL Editor for existing projects.
-- It allows the public AI interview link to:
-- 1. mark an applicant as "Interview Completed"
-- 2. update interview_results if an applicant re-runs the interview

DROP POLICY IF EXISTS "Allow public interview completion updates" ON public.applicants;
CREATE POLICY "Allow public interview completion updates" ON public.applicants
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public interview result updates" ON public.interview_results;
CREATE POLICY "Allow public interview result updates" ON public.interview_results
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
