/*
  # Add RLS policies for submissions table

  1. Security Changes
    - Enable RLS on submissions table
    - Add policies for authenticated users to:
      - Read their own submissions
      - Read submissions for campaigns they own
      - Create new submissions
      - Update their own submissions
    - Add policy for admins to read all submissions
*/

-- Enable RLS on submissions table if not already enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy for creators to read their own submissions
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

-- Policy for creators to create submissions
CREATE POLICY "Creators can create submissions"
ON submissions
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Policy for creators to update their own submissions
CREATE POLICY "Creators can update own submissions"
ON submissions
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Policy for admins to read all submissions
CREATE POLICY "Admins can read all submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);