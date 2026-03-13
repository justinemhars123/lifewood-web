-- Run this in Supabase SQL Editor before testing User Management live data.
-- This migrates legacy public.profiles data into public.users, then drops public.profiles.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_id text unique,
  email text not null unique,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  school text,
  avatar_url text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN', 'SUPER ADMIN')),
  status text not null default 'Active' check (status in ('Active', 'Pending', 'Suspended')),
  last_seen timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- If public.users already existed from an earlier setup, ensure required columns are present.
alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists school text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists display_id text;
alter table public.users add column if not exists role text;
alter table public.users add column if not exists status text;
alter table public.users add column if not exists last_seen timestamptz;
alter table public.users add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.users add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.users
set role = coalesce(nullif(role, ''), 'USER');

update public.users
set status = coalesce(nullif(status, ''), 'Active');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_check
      check (role in ('USER', 'ADMIN', 'SUPER ADMIN'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_status_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_status_check
      check (status in ('Active', 'Pending', 'Suspended'));
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'users'
      and indexname = 'users_email_key'
  ) then
    create unique index users_email_key on public.users (email);
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'users'
      and indexname = 'users_display_id_key'
  ) then
    create unique index users_display_id_key on public.users (display_id);
  end if;
end;
$$;

create or replace function public.set_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_users_updated_at();

create or replace function public.set_users_display_id()
returns trigger
language plpgsql
as $$
begin
  if new.display_id is null or trim(new.display_id) = '' then
    new.display_id := 'PH' || lpad(nextval('public.users_display_id_seq')::text, 3, '0');
  end if;
  return new;
end;
$$;

do $$
declare
  max_suffix int;
begin
  if not exists (
    select 1
    from pg_class
    where relkind = 'S'
      and relname = 'users_display_id_seq'
  ) then
    create sequence public.users_display_id_seq;
  end if;

  select max(nullif(regexp_replace(display_id, '\D', '', 'g'), '')::int)
    into max_suffix
  from public.users
  where display_id is not null and display_id <> '';

  if max_suffix is not null then
    perform setval('public.users_display_id_seq', max_suffix);
  end if;

  update public.users
  set display_id = 'PH' || lpad(nextval('public.users_display_id_seq')::text, 3, '0')
  where display_id is null or display_id = '';
end;
$$;

drop trigger if exists trg_users_display_id on public.users;
create trigger trg_users_display_id
before insert on public.users
for each row
execute function public.set_users_display_id();

do $$
declare
  has_full_name boolean;
  has_role boolean;
  has_status boolean;
  has_last_seen boolean;
  has_created_at boolean;
  has_updated_at boolean;
  migrate_sql text;
begin
  if to_regclass('public.profiles') is not null then
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
    ) into has_full_name;
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
    ) into has_role;
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'status'
    ) into has_status;
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_seen'
    ) into has_last_seen;
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'created_at'
    ) into has_created_at;
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at'
    ) into has_updated_at;

    migrate_sql := format(
      $f$
      insert into public.users (id, email, full_name, role, status, last_seen, created_at, updated_at)
      select
        p.id,
        lower(p.email),
        %1$s,
        %2$s,
        %3$s,
        %4$s,
        %5$s,
        %6$s
      from public.profiles p
      where p.id is not null and p.email is not null
      on conflict (id) do update
        set email = excluded.email,
            full_name = excluded.full_name,
            role = excluded.role,
            status = excluded.status,
            last_seen = excluded.last_seen,
            updated_at = timezone('utc', now());
      $f$,
      case
        when has_full_name then 'nullif(trim(p.full_name), '''')'
        else 'split_part(lower(p.email), ''@'', 1)'
      end,
      case
        when has_role then
          'case
             when lower(coalesce(p.role, ''user'')) in (''super admin'', ''super_admin'', ''superadmin'') then ''SUPER ADMIN''
             when lower(coalesce(p.role, ''user'')) = ''admin'' then ''ADMIN''
             else ''USER''
           end'
        else '''USER'''
      end,
      case
        when has_status then
          'case
             when lower(coalesce(p.status, '''')) = ''pending'' then ''Pending''
             when lower(coalesce(p.status, '''')) = ''suspended'' then ''Suspended''
             else ''Active''
           end'
        else '''Active'''
      end,
      case when has_last_seen then 'p.last_seen' else 'null' end,
      case
        when has_created_at then 'coalesce(p.created_at, timezone(''utc'', now()))'
        else 'timezone(''utc'', now())'
      end,
      case
        when has_updated_at then 'coalesce(p.updated_at, timezone(''utc'', now()))'
        else 'timezone(''utc'', now())'
      end
    );

    execute migrate_sql;

    drop table public.profiles cascade;
  end if;
end;
$$;

create or replace function public.sync_auth_user_to_public_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.users (id, email, full_name, first_name, last_name, phone, school, avatar_url, role, status, last_seen)
    values (
      new.id,
      lower(new.email),
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
      nullif(new.raw_user_meta_data ->> 'firstName', ''),
      nullif(new.raw_user_meta_data ->> 'lastName', ''),
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'school', ''),
      nullif(new.raw_user_meta_data ->> 'avatarUrl', ''),
      case
        when lower(new.email) = 'admin@gmail.com' then 'SUPER ADMIN'
        when lower(coalesce(new.raw_user_meta_data ->> 'role', 'user')) = 'admin' then 'ADMIN'
        when lower(coalesce(new.raw_user_meta_data ->> 'role', 'user')) in ('super admin', 'super_admin', 'superadmin') then 'SUPER ADMIN'
        else 'USER'
      end,
      'Active',
      timezone('utc', now())
    )
    on conflict (id) do update
      set email = excluded.email,
          full_name = excluded.full_name,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          phone = excluded.phone,
          school = excluded.school,
          avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.users.avatar_url),
          role = excluded.role,
          status = 'Active',
          last_seen = timezone('utc', now()),
          updated_at = timezone('utc', now());
  exception
    when others then
      -- Do not block signup if user-sync table has an issue.
      raise warning 'users sync trigger failed for %: %', new.email, sqlerrm;
  end;

  return new;
end;
$$;

-- Remove old auth sync triggers to avoid conflicts with legacy profile functions.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_changed on auth.users;

-- Recreate clean sync triggers for insert and update.
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_auth_user_to_public_users();

create trigger on_auth_user_changed
after update on auth.users
for each row
execute function public.sync_auth_user_to_public_users();

create or replace function public.sync_all_auth_users_to_public_users()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@gmail.com'
    or lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')) in
      ('admin', 'super admin', 'super_admin', 'superadmin')
  ) then
    raise exception 'not authorized';
  end if;

  insert into public.users (id, email, full_name, first_name, last_name, phone, school, avatar_url, role, status, last_seen)
  select
    u.id,
    lower(u.email),
    coalesce(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
    nullif(u.raw_user_meta_data ->> 'firstName', ''),
    nullif(u.raw_user_meta_data ->> 'lastName', ''),
    nullif(u.raw_user_meta_data ->> 'phone', ''),
    nullif(u.raw_user_meta_data ->> 'school', ''),
    nullif(u.raw_user_meta_data ->> 'avatarUrl', ''),
    case
      when lower(u.email) = 'admin@gmail.com' then 'SUPER ADMIN'
      when lower(coalesce(u.raw_user_meta_data ->> 'role', 'user')) = 'admin' then 'ADMIN'
      when lower(coalesce(u.raw_user_meta_data ->> 'role', 'user')) in ('super admin', 'super_admin', 'superadmin') then 'SUPER ADMIN'
      else 'USER'
    end,
    'Active',
    timezone('utc', now())
  from auth.users u
  where u.email is not null
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        phone = excluded.phone,
        school = excluded.school,
        avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.users.avatar_url),
        role = excluded.role,
        status = excluded.status,
        last_seen = excluded.last_seen,
        updated_at = timezone('utc', now());
end;
$$;

grant execute on function public.sync_all_auth_users_to_public_users() to authenticated;

create or replace function public.admin_delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  requester_role text := lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'role', ''));
  target_email text;
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  if not (
    requester_email = 'admin@gmail.com'
    or requester_role in ('admin', 'super admin', 'super_admin', 'superadmin')
  ) then
    raise exception 'not authorized';
  end if;

  select lower(email) into target_email
  from auth.users
  where id = target_user_id;

  if target_email is null then
    return;
  end if;

  if target_email = 'admin@gmail.com' then
    raise exception 'cannot delete fixed super admin';
  end if;

  delete from auth.users
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_delete_user_account(uuid) to authenticated;

insert into public.users (id, email, full_name, first_name, last_name, phone, school, avatar_url, role, status, last_seen)
select
  u.id,
  lower(u.email),
  coalesce(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  nullif(u.raw_user_meta_data ->> 'firstName', ''),
  nullif(u.raw_user_meta_data ->> 'lastName', ''),
  nullif(u.raw_user_meta_data ->> 'phone', ''),
  nullif(u.raw_user_meta_data ->> 'school', ''),
  nullif(u.raw_user_meta_data ->> 'avatarUrl', ''),
  case
    when lower(u.email) = 'admin@gmail.com' then 'SUPER ADMIN'
    when lower(coalesce(u.raw_user_meta_data ->> 'role', 'user')) = 'admin' then 'ADMIN'
    when lower(coalesce(u.raw_user_meta_data ->> 'role', 'user')) in ('super admin', 'super_admin', 'superadmin') then 'SUPER ADMIN'
    else 'USER'
  end,
  'Active',
  timezone('utc', now())
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      school = excluded.school,
      avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.users.avatar_url),
      role = excluded.role,
      status = excluded.status,
      last_seen = excluded.last_seen,
      updated_at = timezone('utc', now());

alter table public.users enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_insert_self on public.users;
create policy users_insert_self
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists users_admin_read_all on public.users;
create policy users_admin_read_all
on public.users
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@gmail.com'
  or
  lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')) in
  ('admin', 'super admin', 'super_admin', 'superadmin')
);

drop policy if exists users_admin_update_all on public.users;
create policy users_admin_update_all
on public.users
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@gmail.com'
  or
  lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')) in
  ('admin', 'super admin', 'super_admin', 'superadmin')
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@gmail.com'
  or
  lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')) in
  ('admin', 'super admin', 'super_admin', 'superadmin')
);
