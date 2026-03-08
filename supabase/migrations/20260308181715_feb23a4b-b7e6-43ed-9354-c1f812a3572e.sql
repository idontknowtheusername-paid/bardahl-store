-- Remove duplicate cron jobs
SELECT cron.unschedule('oil-change-daily');
SELECT cron.unschedule('daily-oil-change-reminders');

-- Create single cron job at 19h (7 PM) daily
SELECT cron.schedule(
  'oil-change-reminders-evening',
  '0 19 * * *',
  $$
  SELECT net.http_post(
    url:='https://ybjvncrqhcrsoijtxawp.supabase.co/functions/v1/oil-change-reminder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlianZuY3JxaGNyc29panR4YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjM4NTMsImV4cCI6MjA4NjU5OTg1M30.5RLQSwULOFMFjhv1GwLfBMtllsZ1ubMbDZri_Hir8F8"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);