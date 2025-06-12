-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update any submission" ON submissions;
DROP POLICY IF EXISTS "Enable update for admins" ON submissions;

-- Create new admin update policy with proper permissions
CREATE POLICY "Enable admin submission updates"
ON submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;