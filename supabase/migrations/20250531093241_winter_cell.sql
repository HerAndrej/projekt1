-- Create storage schema if it doesn't exist
create schema if not exists storage;

-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public, owner, created_at, updated_at, file_size_limit, allowed_mime_types)
values (
  'campaign-images',
  'campaign-images',
  true,
  '00000000-0000-0000-0000-000000000000',
  now(),
  now(),
  null,
  null
)
on conflict (id) do nothing;

-- Create policy to allow authenticated users to upload files
create policy "authenticated_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'campaign-images'
);

-- Create policy to allow authenticated users to delete their own files
create policy "authenticated_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'campaign-images' 
  and owner = auth.uid()
);

-- Create policy to allow public access to read campaign images
create policy "public_read"
on storage.objects for select
to public
using (
  bucket_id = 'campaign-images'
);