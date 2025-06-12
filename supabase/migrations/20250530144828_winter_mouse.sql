-- Add file_links column to campaigns table
ALTER TABLE campaigns ADD COLUMN file_links text[] DEFAULT '{}';

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Enable insert for admins" ON campaigns;
DROP POLICY IF EXISTS "Enable update for admins" ON campaigns;
DROP POLICY IF EXISTS "Enable delete for admins" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for all users" ON campaigns;

CREATE POLICY "Enable insert for admins"
ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Enable update for admins"
ON campaigns
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Enable delete for admins"
ON campaigns
FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Enable read access for all users"
ON campaigns
FOR SELECT
TO authenticated
USING (true);