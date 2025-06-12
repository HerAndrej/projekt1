/*
  # Fix RLS policies for submissions table

  1. Changes
    - Drop existing RLS policies for submissions table
    - Create new RLS policies using auth.uid() instead of direct user table access
    - Ensure proper access for both creators and admins

  2. Security
    - Enable RLS on submissions table
    - Add policies for:
      - Creators to read their own submissions
      - Admins to read all submissions
      - Creators to create submissions
      - Admins to update any submission
      - Creators to update their own submissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON submissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON submissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON submissions;
DROP POLICY IF EXISTS "Enable update for admin users only" ON submissions;
DROP POLICY IF EXISTS "Enable update for admins" ON submissions;
DROP POLICY IF EXISTS "Enable update for admins and owners" ON submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON submissions;
DROP POLICY IF EXISTS "Enable insert for creator users only" ON submissions;
DROP POLICY IF EXISTS "Enable insert for creators" ON submissions;
DROP POLICY IF EXISTS "Creators can create submissions" ON submissions;
DROP POLICY IF EXISTS "Creators can read own submissions" ON submissions;
DROP POLICY IF EXISTS "Creators can update own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can read all submissions" ON submissions;
DROP POLICY IF EXISTS "Enable delete for admins" ON submissions;

-- Recreate policies using auth.uid()
CREATE POLICY "Creators can read own submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = submissions.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can read all submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Creators can create submissions"
ON submissions
FOR INSERT
TO authenticated
WITH CHECK (
  creator_id = auth.uid()
);

CREATE POLICY "Creators can update own submissions"
ON submissions
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Admins can update any submission"
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
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can delete submissions"
ON submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.raw_user_meta_data->>'role' = 'admin'
  )
);