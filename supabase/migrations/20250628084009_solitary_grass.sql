-- TruthGuard Database Schema Migration
-- This migration creates the complete database structure for the TruthGuard application

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  analysis_results jsonb DEFAULT '{}',
  blockchain_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'flagged', 'failed')),
  confidence_score real DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table (check if user_id column exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      full_name text,
      company text,
      role text,
      bio text,
      avatar_url text,
      preferences jsonb DEFAULT '{}',
      settings jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
      ALTER TABLE user_profiles ADD COLUMN full_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company') THEN
      ALTER TABLE user_profiles ADD COLUMN company text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
      ALTER TABLE user_profiles ADD COLUMN role text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'settings') THEN
      ALTER TABLE user_profiles ADD COLUMN settings jsonb DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price_monthly decimal(10,2),
  price_yearly decimal(10,2),
  features jsonb DEFAULT '[]',
  limits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_reports table
CREATE TABLE IF NOT EXISTS verification_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  report_type text DEFAULT 'standard' CHECK (report_type IN ('standard', 'detailed', 'summary', 'custom')),
  data jsonb DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_public boolean DEFAULT false,
  download_count integer DEFAULT 0
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions jsonb DEFAULT '[]',
  rate_limit integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_confidence ON verifications(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_verification_reports_user_id ON verification_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_reports_type ON verification_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop and recreate verifications policies
  DROP POLICY IF EXISTS "Users can view own verifications" ON verifications;
  DROP POLICY IF EXISTS "Users can insert own verifications" ON verifications;
  DROP POLICY IF EXISTS "Users can update own verifications" ON verifications;
  DROP POLICY IF EXISTS "Users can delete own verifications" ON verifications;

  -- Drop and recreate user_profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

  -- Drop and recreate subscription_plans policies
  DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;

  -- Drop and recreate user_subscriptions policies
  DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
  DROP POLICY IF EXISTS "Users can insert own subscriptions" ON user_subscriptions;
  DROP POLICY IF EXISTS "Users can update own subscriptions" ON user_subscriptions;

  -- Drop and recreate verification_reports policies
  DROP POLICY IF EXISTS "Users can view own reports" ON verification_reports;
  DROP POLICY IF EXISTS "Users can insert own reports" ON verification_reports;
  DROP POLICY IF EXISTS "Users can update own reports" ON verification_reports;
  DROP POLICY IF EXISTS "Users can delete own reports" ON verification_reports;

  -- Drop and recreate api_keys policies
  DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;

  -- Drop and recreate audit_logs policies
  DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
END $$;

-- Create RLS policies for verifications
CREATE POLICY "Users can view own verifications"
  ON verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications"
  ON verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own verifications"
  ON verifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for verification_reports
CREATE POLICY "Users can view own reports"
  ON verification_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own reports"
  ON verification_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON verification_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON verification_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for audit_logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;

-- Create triggers for updated_at
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans (only if they don't exist)
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits) 
SELECT 'Free', 'Perfect for getting started', 0.00, 0.00, 
       '["Basic verification", "10 verifications/month", "Standard support"]'::jsonb,
       '{"verifications_per_month": 10, "file_size_mb": 10, "api_calls_per_day": 100}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Free');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits)
SELECT 'Basic', 'Great for individuals and small teams', 9.99, 95.99,
       '["Advanced verification", "100 verifications/month", "Priority support", "Analytics dashboard"]'::jsonb,
       '{"verifications_per_month": 100, "file_size_mb": 100, "api_calls_per_day": 1000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Basic');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits)
SELECT 'Pro', 'Perfect for organizations and enterprises', 29.99, 269.99,
       '["Unlimited verifications", "API access", "Custom integrations", "White-label options", "24/7 support"]'::jsonb,
       '{"verifications_per_month": -1, "file_size_mb": 1000, "api_calls_per_day": 10000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Pro');