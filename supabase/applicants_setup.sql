-- Run this in your Supabase SQL Editor to prepare the database for the form submissions.

-- 1. Create the `applicants` table
CREATE TABLE IF NOT EXISTS public.applicants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text NOT NULL,
  age text,
  phone text NOT NULL,
  email text NOT NULL,
  position text NOT NULL,
  country text NOT NULL,
  address text NOT NULL,
  cv_name text NOT NULL,
  cv_url text,
  status text DEFAULT 'New',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (so public users can submit applications)
CREATE POLICY "Allow public inserts" ON public.applicants
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated admins to view/update
-- (Assuming admins are authenticated users. Modify if your auth policies restrict admins differently)
CREATE POLICY "Allow authenticated read" ON public.applicants
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.applicants
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.applicants
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. Create a Custom Storage Bucket for CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for CVs
-- Allow anyone to upload CVs to the `cvs` bucket
CREATE POLICY "Allow public cv uploads" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'cvs');

-- Allow anyone to read CVs (so Admins can see them when they click the link)
CREATE POLICY "Allow public cv reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'cvs');
