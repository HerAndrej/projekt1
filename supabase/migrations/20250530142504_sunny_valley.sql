-- Enable RLS on the campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy for campaigns table
CREATE POLICY "Enable read access for all authenticated users" ON campaigns
FOR SELECT
TO authenticated
USING (
  (auth.role() = 'admin'::text) OR 
  (auth.uid() = user_id)
);

-- Policy for insert
CREATE POLICY "Enable insert for authenticated users" ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'admin'::text
);

-- Policy for update
CREATE POLICY "Enable update for admins and owners" ON campaigns
FOR UPDATE
TO authenticated
USING (
  (auth.role() = 'admin'::text) OR 
  (auth.uid() = user_id)
)
WITH CHECK (
  (auth.role() = 'admin'::text) OR 
  (auth.uid() = user_id)
);

-- Policy for delete
CREATE POLICY "Enable delete for admins and owners" ON campaigns
FOR DELETE
TO authenticated
USING (
  (auth.role() = 'admin'::text) OR 
  (auth.uid() = user_id)
);

-- Enable RLS on the submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy for submissions table
CREATE POLICY "Enable read access for all authenticated users" ON submissions
FOR SELECT
TO authenticated
USING (true);

-- Policy for insert submissions
CREATE POLICY "Enable insert for authenticated users" ON submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Policy for update submissions
CREATE POLICY "Enable update for admins and owners" ON submissions
FOR UPDATE
TO authenticated
USING (
  (auth.role() = 'admin'::text) OR 
  (auth.uid() = creator_id)
);

-- Policy for delete submissions
CREATE POLICY "Enable delete for admins" ON submissions
FOR DELETE
TO authenticated
USING (auth.role() = 'admin'::text);