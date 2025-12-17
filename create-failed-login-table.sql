-- Create failed_login_attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_failed_login_identifier ON failed_login_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_failed_login_blocked ON failed_login_attempts(blocked_until);
CREATE INDEX IF NOT EXISTS idx_failed_login_last_attempt ON failed_login_attempts(last_attempt_at);

-- Enable RLS
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role only"
ON failed_login_attempts
FOR ALL
TO service_role
USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_failed_login_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS failed_login_updated_at_trigger ON failed_login_attempts;

-- Create trigger
CREATE TRIGGER failed_login_updated_at_trigger
BEFORE UPDATE ON failed_login_attempts
FOR EACH ROW
EXECUTE FUNCTION update_failed_login_updated_at();

-- Clean up old records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_failed_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM failed_login_attempts
  WHERE last_attempt_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql;

-- Verify installation
SELECT 
  'Failed login attempts table created successfully!' as status,
  COUNT(*) as total_records
FROM failed_login_attempts;
