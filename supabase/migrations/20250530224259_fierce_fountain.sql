-- Drop existing policies
DROP POLICY IF EXISTS "Enable admin submission updates" ON submissions;
DROP POLICY IF EXISTS "Creators can update own submissions" ON submissions;

-- Create new admin update policy with proper permissions
CREATE POLICY "Enable admin submission updates"
ON submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (true);

-- Create creator update policy
CREATE POLICY "Creators can update own submissions"
ON submissions
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;