/*
  # Enhanced Memory Storage Schema

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `transcript` (text, the original voice input)
      - `summary` (text, AI-generated summary)
      - `emotion` (text, detected emotion)
      - `keywords` (text array, extracted keywords)
      - `poem` (text, AI-generated poem)
      - `blockchain_hash` (text, verification hash)
      - `verification_status` (text, verification status)
      - `audio_duration` (integer, duration in seconds)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `memories` table
    - Add policies for authenticated users to manage their own memories

  3. Indexes
    - Add indexes for efficient searching and filtering
*/

CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Memory',
  transcript text NOT NULL,
  summary text,
  emotion text DEFAULT 'neutral',
  keywords text[] DEFAULT '{}',
  poem text,
  blockchain_hash text,
  verification_status text DEFAULT 'pending',
  audio_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Policies for memories
CREATE POLICY "Users can view own memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_keywords ON memories USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_memories_search ON memories USING GIN(to_tsvector('english', title || ' ' || summary || ' ' || transcript));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();