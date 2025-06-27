/*
  # Enhanced ProofMate Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `memory_analytics` - Analytics and metrics for memories
    - `user_achievements` - Achievement tracking
    - `memory_comments` - Comments on memories
    - `memory_ratings` - Rating system for memories

  2. Enhanced Tables
    - Add new columns to existing `memories` table
    - Add indexes for better performance

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username text,
  bio text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memory_comments table
CREATE TABLE IF NOT EXISTS memory_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memory_ratings table
CREATE TABLE IF NOT EXISTS memory_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memory_id, user_id)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_data jsonb DEFAULT '{}',
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Add new columns to memories table if they don't exist
DO $$
BEGIN
  -- Add rating column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'rating'
  ) THEN
    ALTER TABLE memories ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
  END IF;

  -- Add word_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'word_count'
  ) THEN
    ALTER TABLE memories ADD COLUMN word_count integer DEFAULT 0;
  END IF;

  -- Add confidence column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'confidence'
  ) THEN
    ALTER TABLE memories ADD COLUMN confidence real DEFAULT 0;
  END IF;

  -- Add recording_quality column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'recording_quality'
  ) THEN
    ALTER TABLE memories ADD COLUMN recording_quality text DEFAULT 'standard';
  END IF;

  -- Add due_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE memories ADD COLUMN due_date timestamptz;
  END IF;

  -- Add sentiment column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'sentiment'
  ) THEN
    ALTER TABLE memories ADD COLUMN sentiment text DEFAULT 'neutral';
  END IF;

  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'category'
  ) THEN
    ALTER TABLE memories ADD COLUMN category text DEFAULT 'general';
  END IF;

  -- Add priority column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'priority'
  ) THEN
    ALTER TABLE memories ADD COLUMN priority text DEFAULT 'medium';
  END IF;

  -- Add action_items column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'action_items'
  ) THEN
    ALTER TABLE memories ADD COLUMN action_items text[] DEFAULT '{}';
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'tags'
  ) THEN
    ALTER TABLE memories ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for memory_comments
CREATE POLICY "Users can view comments on own memories"
  ON memory_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_comments.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on own memories"
  ON memory_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON memory_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON memory_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for memory_ratings
CREATE POLICY "Users can view ratings on own memories"
  ON memory_ratings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_ratings.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can rate own memories"
  ON memory_ratings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_id 
      AND memories.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_comments_memory_id ON memory_comments(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_comments_user_id ON memory_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_ratings_memory_id ON memory_ratings(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_ratings_user_id ON memory_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_rating ON memories(rating);
CREATE INDEX IF NOT EXISTS idx_memories_due_date ON memories(due_date);
CREATE INDEX IF NOT EXISTS idx_memories_sentiment ON memories(sentiment);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_priority ON memories(priority);

-- Update triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_comments_updated_at
  BEFORE UPDATE ON memory_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_ratings_updated_at
  BEFORE UPDATE ON memory_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();