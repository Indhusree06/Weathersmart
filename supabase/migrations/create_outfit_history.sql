-- Create outfit_history table
CREATE TABLE IF NOT EXISTS outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  worn_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  outfit_data JSONB NOT NULL,
  weather TEXT,
  location TEXT,
  occasion TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_outfit_history_user_id ON outfit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_history_worn_date ON outfit_history(worn_date DESC);
CREATE INDEX IF NOT EXISTS idx_outfit_history_profile_id ON outfit_history(profile_id);

-- Enable RLS
ALTER TABLE outfit_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own outfit history"
  ON outfit_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfit history"
  ON outfit_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit history"
  ON outfit_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit history"
  ON outfit_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to increment wear count
CREATE OR REPLACE FUNCTION increment_wear_count(item_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE wardrobe_items
  SET wear_count = COALESCE(wear_count, 0) + 1
  WHERE id = ANY(item_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add last_worn column to wardrobe_items if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wardrobe_items' AND column_name = 'last_worn'
  ) THEN
    ALTER TABLE wardrobe_items ADD COLUMN last_worn TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
