-- Create users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_paid boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Users can view their own data
create policy "Users can view own data"
  on public.users
  for select
  using (auth.uid() = id);

-- Users can insert their own data
create policy "Users can insert own data"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Create resumes table
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  resume_json jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.resumes enable row level security;

-- Users can view their own resumes
create policy "Users can view own resumes"
  on public.resumes
  for select
  using (auth.uid() = user_id);

-- Users can insert their own resumes
create policy "Users can insert own resumes"
  on public.resumes
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own resumes
create policy "Users can update own resumes"
  on public.resumes
  for update
  using (auth.uid() = user_id);