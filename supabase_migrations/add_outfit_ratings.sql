-- Add rating column to outfit_recommendations table
-- This allows users to rate AI-generated outfits from 1-10

-- Check if the column doesn't already exist and add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfit_recommendations' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE outfit_recommendations 
    ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 10);
    
    COMMENT ON COLUMN outfit_recommendations.rating IS 'User rating of AI outfit recommendation (1-10)';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist (for tracking rating changes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfit_recommendations' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE outfit_recommendations 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outfit_recommendation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatically updating updated_at
DROP TRIGGER IF EXISTS outfit_recommendation_updated_at ON outfit_recommendations;
CREATE TRIGGER outfit_recommendation_updated_at
  BEFORE UPDATE ON outfit_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_recommendation_timestamp();

-- Add index for better performance when querying by rating
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_rating 
ON outfit_recommendations(rating) 
WHERE rating IS NOT NULL;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Successfully added rating functionality to outfit_recommendations table';
END $$;

