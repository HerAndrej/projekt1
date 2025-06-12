/*
  # Add unique constraint to campaign_metrics table

  1. Changes
    - Add unique constraint on campaign_metrics table for (campaign_id, submission_id, date)
    This ensures that the ON CONFLICT clause in the update_campaign_metrics trigger 
    can correctly identify and update existing rows.

  2. Impact
    - Fixes the error "there is no unique or exclusion constraint matching the ON CONFLICT specification"
    - Ensures data integrity by preventing duplicate metrics entries for the same campaign, submission and date
*/

ALTER TABLE campaign_metrics 
ADD CONSTRAINT campaign_metrics_campaign_submission_date_key 
UNIQUE (campaign_id, submission_id, date);