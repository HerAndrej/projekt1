-- Add competition fields to campaigns table
ALTER TABLE campaigns
ADD COLUMN has_competition boolean DEFAULT false,
ADD COLUMN prizes jsonb DEFAULT null;

-- Add competition fields to submissions table
ALTER TABLE submissions
ADD COLUMN competition_rank integer DEFAULT null,
ADD COLUMN competition_prize numeric DEFAULT null;