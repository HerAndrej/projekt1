-- Add daily metrics tracking
CREATE TABLE campaign_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  date date NOT NULL,
  views integer DEFAULT 0,
  earnings numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add index for faster querying
CREATE INDEX campaign_metrics_date_idx ON campaign_metrics(date);
CREATE INDEX campaign_metrics_campaign_id_idx ON campaign_metrics(campaign_id);
CREATE INDEX campaign_metrics_submission_id_idx ON campaign_metrics(submission_id);

-- Enable RLS
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users"
ON campaign_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for admins"
ON campaign_metrics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Enable update for admins"
ON campaign_metrics FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Add trigger to update metrics when submission views/earnings change
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update today's metrics
  INSERT INTO campaign_metrics (
    campaign_id,
    submission_id,
    date,
    views,
    earnings
  )
  VALUES (
    NEW.campaign_id,
    NEW.id,
    CURRENT_DATE,
    NEW.views - COALESCE(OLD.views, 0),
    NEW.earnings - COALESCE(OLD.earnings, 0)
  )
  ON CONFLICT (campaign_id, submission_id, date)
  DO UPDATE SET
    views = campaign_metrics.views + EXCLUDED.views,
    earnings = campaign_metrics.earnings + EXCLUDED.earnings,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_submission_change
  AFTER UPDATE OF views, earnings ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics();