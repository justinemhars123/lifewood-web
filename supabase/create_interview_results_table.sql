-- Run this in Supabase SQL Editor to ensure the interview_results table
-- matches what the app expects for transcript + score storage.

create table if not exists public.interview_results (
  id uuid default gen_random_uuid() primary key,
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  qa_transcript jsonb not null default '[]'::jsonb,
  interview_score integer,
  evaluation_summary text,
  created_at timestamptz default timezone('utc', now()) not null
);

alter table public.interview_results
  add column if not exists applicant_id uuid;

alter table public.interview_results
  add column if not exists qa_transcript jsonb not null default '[]'::jsonb;

alter table public.interview_results
  add column if not exists interview_score integer;

alter table public.interview_results
  add column if not exists evaluation_summary text;

alter table public.interview_results
  add column if not exists created_at timestamptz default timezone('utc', now()) not null;

alter table public.interview_results
  drop constraint if exists interview_results_applicant_id_fkey;

alter table public.interview_results
  add constraint interview_results_applicant_id_fkey
  foreign key (applicant_id)
  references public.applicants(id)
  on delete cascade;

alter table public.interview_results enable row level security;

drop policy if exists "Allow public interview result inserts" on public.interview_results;
create policy "Allow public interview result inserts" on public.interview_results
  for insert
  with check (true);

drop policy if exists "Allow authenticated interview result read" on public.interview_results;
create policy "Allow authenticated interview result read" on public.interview_results
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Allow authenticated interview result update" on public.interview_results;
create policy "Allow authenticated interview result update" on public.interview_results
  for update
  using (auth.role() = 'authenticated');

drop policy if exists "Allow public interview result updates" on public.interview_results;
create policy "Allow public interview result updates" on public.interview_results
  for update
  using (true)
  with check (true);
