/*
  # Update earnings column name from 3k to 1k views

  1. Changes
    - Rename earnings_per_3k_views to earnings_per_1k_views in campaigns table
    - Update any existing data to reflect the new calculation (divide by 3)

  2. Data Migration
    - Existing campaigns will have their earnings adjusted for 1k views instead of 3k
*/

-- Rename the column
ALTER TABLE campaigns 
RENAME COLUMN earnings_per_3k_views TO earnings_per_1k_views;

-- Update existing data to reflect 1k views instead of 3k views
-- Divide existing values by 3 to maintain the same effective rate
UPDATE campaigns 
SET earnings_per_1k_views = earnings_per_1k_views / 3 
WHERE earnings_per_1k_views > 0;