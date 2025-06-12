/*
  # Fix campaign metrics RLS policies

  1. Changes
    - Enable RLS on campaign_metrics table
    - Add policy for admins to perform all operations
    - Add policy for authenticated users to read metrics
    - Add policy for public users to read metrics

  2. Security
    - Admins can perform all operations (INSERT, UPDATE, DELETE, SELECT)
    - Authenticated users can only read metrics
    - Public users can only read metrics
*/

-- Enable RLS on campaign_metrics table (if not already enabled)
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for admins" ON campaign_metrics;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON campaign_metrics;
DROP POLICY IF EXISTS "Enable update for admins" ON campaign_metrics;

-- Create comprehensive admin policy for all operations
CREATE POLICY "Enable all operations for admins"
ON campaign_metrics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Create read-only policy for authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON campaign_metrics
FOR SELECT
TO authenticated
USING (true);

-- Create read-only policy for public users
CREATE POLICY "Enable read access for public users"
ON campaign_metrics
FOR SELECT
TO public
USING (true);