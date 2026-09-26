-- Run this once in Supabase SQL Editor for admin image uploads.
insert into storage.buckets (id, name, public)
values ('church-media', 'church-media', true)
on conflict (id) do update set public = true;

-- Public visitors can render published media URLs.
drop policy if exists "Public can read church media" on storage.objects;
create policy "Public can read church media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'church-media');

-- Server uploads use SUPABASE_SERVICE_ROLE_KEY and bypass these policies.
