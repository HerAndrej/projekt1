/*
  # Add allowed networks to campaigns

  1. Changes
    - Add allowed_networks column to campaigns table
    - Update existing campaigns to have all networks allowed by default

  2. Schema
    - allowed_networks: text array containing 'instagram', 'tiktok', 'youtube'
*/

-- Add allowed_networks column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN allowed_networks text[] DEFAULT ARRAY['instagram', 'tiktok', 'youtube'];

-- Update existing campaigns to have all networks allowed
UPDATE campaigns 
SET allowed_networks = ARRAY['instagram', 'tiktok', 'youtube'] 
WHERE allowed_networks IS NULL;