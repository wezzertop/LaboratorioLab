-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  license_number text, -- Cédula profesional
  digital_signature_url text, -- URL de la firma en Supabase Storage
  company_logo_url text, -- URL del logotipo en Supabase Storage
  credits integer default 0,
  free_reports_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.profiles enable row level security;

-- Create Policies for Profiles
create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  location text,
  status text default 'EN EJECUCIÓN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.projects enable row level security;

-- Create Policies for Projects
create policy "Users can view their own projects."
  on projects for select
  using ( auth.uid() = user_id );

create policy "Users can create their own projects."
  on projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own projects."
  on projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own projects."
  on projects for delete
  using ( auth.uid() = user_id );

-- 3. Create Tests Table (Test History)
create table public.tests (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_type text not null, -- 'asfalto', 'concreto', 'suelos'
  name text not null, -- e.g. "AEC #1 - Grava 3/4"
  status text default 'BORRADOR', -- 'BORRADOR', 'FINALIZADO'
  data jsonb not null default '{}'::jsonb, -- All the form data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.tests enable row level security;

-- Create Policies for Tests
create policy "Users can view their own tests."
  on tests for select
  using ( auth.uid() = user_id );

create policy "Users can create their own tests."
  on tests for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own tests."
  on tests for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own tests."
  on tests for delete
  using ( auth.uid() = user_id );
