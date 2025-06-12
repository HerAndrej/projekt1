-- Remove pricing-related columns from campaigns table
ALTER TABLE campaigns 
  DROP COLUMN IF EXISTS base_price,
  DROP COLUMN IF EXISTS additional_price,
  DROP COLUMN IF EXISTS price_description;