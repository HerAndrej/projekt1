-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb
);

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  content_type content_type NOT NULL,
  earnings_per_3k_views integer NOT NULL,
  total_budget numeric NOT NULL,
  spent_budget numeric DEFAULT 0,
  status campaign_status DEFAULT 'active',
  file_links text[] DEFAULT '{}',
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES users(id),
  social_media_link text NOT NULL,
  video_links text[] NOT NULL,
  status submission_status DEFAULT 'pending',
  views integer DEFAULT 0,
  earnings numeric DEFAULT 0,
  submitted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
DROP POLICY IF EXISTS "Enable full access for admins" ON campaigns;
CREATE POLICY "Enable full access for admins"
ON campaigns FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON campaigns;
CREATE POLICY "Enable read access for authenticated users"
ON campaigns FOR SELECT
TO authenticated
USING (true);

-- Create policies for submissions
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON submissions;
CREATE POLICY "Enable read access for authenticated users"
ON submissions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Enable insert for creators" ON submissions;
CREATE POLICY "Enable insert for creators"
ON submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Enable update for admins" ON submissions;
CREATE POLICY "Enable update for admins"
ON submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- Add triggers
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();