-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily oil change reminder job (every day at 9 AM)
SELECT cron.schedule(
  'oil-change-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://ybjvncrqhcrsoijtxawp.supabase.co/functions/v1/oil-change-reminder',
    headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlianZuY3JxaGNyc29panR4YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjM4NTMsImV4cCI6MjA4NjU5OTg1M30.5RLQSwULOFMFjhv1GwLfBMtllsZ1ubMbDZri_Hir8F8", "Content-Type": "application/json"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('oil-change-daily');
