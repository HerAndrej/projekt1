-- Add logo and thumbnail columns to campaigns table
ALTER TABLE campaigns
ADD COLUMN logo_url text,
ADD COLUMN thumbnail_url text;