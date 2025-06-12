/*
  # Add campaign duration and budget management

  1. Changes
    - Add end_date column to campaigns table
    - Add budget_per_day column to campaigns table
    - Add trigger to automatically complete campaigns when end date is reached

  2. Security
    - Maintain existing RLS policies
    - Add trigger for automatic campaign completion
*/

-- Add new columns to campaigns table
ALTER TABLE campaigns
ADD COLUMN end_date timestamp with time zone,
ADD COLUMN budget_per_day numeric DEFAULT 0;

-- Create function to check and update campaign status
CREATE OR REPLACE FUNCTION check_campaign_end_date()
RETURNS trigger AS $$
BEGIN
  -- Check if campaign has ended
  IF NEW.end_date IS NOT NULL AND NEW.end_date <= CURRENT_TIMESTAMP AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically complete campaigns
CREATE TRIGGER campaign_auto_complete
  BEFORE UPDATE OR INSERT ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION check_campaign_end_date();