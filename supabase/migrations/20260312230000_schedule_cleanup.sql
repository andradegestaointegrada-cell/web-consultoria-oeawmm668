-- Enable pg_net to make HTTP requests if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Enable pg_cron to schedule jobs if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup bucket edge function to run every Sunday at midnight
-- It uses pg_net to trigger the Edge Function automatically based on the retention policy
SELECT cron.schedule(
  'cleanup-bucket-weekly',
  '0 0 * * 0',
  $$
  SELECT net.http_post(
      url:='https://whyurpgdxrccrnuhxmva.supabase.co/functions/v1/cleanup-bucket',
      headers:='{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
