/*
  # Add RLS policies for users table

  1. Changes
    - Enable RLS on users table
    - Add policies for authenticated users to read user data
    - Add policies for public access to read user data

  2. Security
    - Enable RLS on users table
    - Add policy for authenticated users to read all user data
    - Add policy for public users to read all user data (needed for campaign/submission joins)
*/

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for authenticated users"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for public users"
ON users
FOR SELECT
TO public
USING (true);