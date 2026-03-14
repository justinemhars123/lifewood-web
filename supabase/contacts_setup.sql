-- 1. Create the `contacts` table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'New',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (so public users can submit contact requests)
CREATE POLICY "Allow public contact inserts" ON public.contacts
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated admins to view/update/delete
CREATE POLICY "Allow authenticated contact read" ON public.contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated contact update" ON public.contacts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated contact delete" ON public.contacts
  FOR DELETE
  USING (auth.role() = 'authenticated');
