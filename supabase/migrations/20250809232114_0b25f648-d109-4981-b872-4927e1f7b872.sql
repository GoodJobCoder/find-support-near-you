-- Create profiles table to store account details and preferences
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  language text default 'en',
  theme text default 'system',
  notifications boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Timestamp update function (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create or replace trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Function to create a default profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, language, theme, notifications)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email), null, 'en', 'system', true)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to run on new auth users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();