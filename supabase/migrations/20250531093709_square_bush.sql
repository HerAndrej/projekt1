-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create a function to handle file uploads
create or replace function handle_storage_upload()
returns trigger as $$
begin
  -- Set the owner to the authenticated user
  new.owner = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically set the owner on upload
create trigger set_storage_owner
  before insert on storage.objects
  for each row
  execute function handle_storage_upload();

-- Create a function to verify file size and type
create or replace function verify_upload_constraints()
returns trigger as $$
begin
  -- Check file size (50MB limit)
  if octet_length(new.content) > 52428800 then
    raise exception 'File size exceeds 50MB limit';
  end if;
  
  -- Check mime type
  if new.metadata->>'mimetype' not in ('image/jpeg', 'image/png', 'image/gif', 'image/webp') then
    raise exception 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to verify constraints before upload
create trigger verify_upload
  before insert on storage.objects
  for each row
  execute function verify_upload_constraints();

-- Create security policies
create policy "Public Access"
  on storage.objects for select
  to public
  using ( bucket_id = 'campaign-images' );

create policy "Creator Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'campaign-images' );

create policy "Creator Delete Own Files"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'campaign-images' and owner = auth.uid() );

create policy "Creator Update Own Files"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'campaign-images' and owner = auth.uid() )
  with check ( bucket_id = 'campaign-images' and owner = auth.uid() );