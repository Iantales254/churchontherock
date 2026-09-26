-- Church on the Rock database schema
create table if not exists public.events (id uuid primary key default gen_random_uuid(), title text not null, description text, date text, location text, url text, created_at timestamptz default now());
create table if not exists public.branches (id uuid primary key default gen_random_uuid(), name text not null, location text, service_times text, contact_info text, created_at timestamptz default now());
create table if not exists public.sermons (id uuid primary key default gen_random_uuid(), title text not null, description text, date text, preacher text, youtube_url text, created_at timestamptz default now());
create table if not exists public.gallery (id uuid primary key default gen_random_uuid(), title text, url text not null, description text, created_at timestamptz default now());
create table if not exists public.people (id uuid primary key default gen_random_uuid(), name text not null, role text, bio text, photo_url text, created_at timestamptz default now());
create table if not exists public.fellowships (id uuid primary key default gen_random_uuid(), name text not null, day text, time text, location text, description text, created_at timestamptz default now());
create table if not exists public.articles (id uuid primary key default gen_random_uuid(), title text not null, description text, date text, location text, url text, created_at timestamptz default now());
create table if not exists public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text unique not null, subscribed_at timestamptz default now());
create table if not exists public.contact_messages (id uuid primary key default gen_random_uuid(), name text, email text, message text, created_at timestamptz default now());
create table if not exists public.donations (id uuid primary key default gen_random_uuid(), donor_name text, amount numeric(10,2), method text, created_at timestamptz default now());
create table if not exists public.admin_users (id uuid primary key default gen_random_uuid(), email text unique not null, role text default 'editor', created_at timestamptz default now());

alter table public.events enable row level security;
alter table public.branches enable row level security;
alter table public.sermons enable row level security;
alter table public.gallery enable row level security;
alter table public.people enable row level security;
alter table public.fellowships enable row level security;
alter table public.articles enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.donations enable row level security;
alter table public.admin_users enable row level security;

do $$ declare table_name text; begin
  foreach table_name in array array['events','branches','sermons','gallery','people','fellowships','articles'] loop
    execute format('drop policy if exists "Public can read %1$s" on public.%1$s', table_name);
    execute format('create policy "Public can read %1$s" on public.%1$s for select to anon, authenticated using (true)', table_name);
  end loop;
end $$;


