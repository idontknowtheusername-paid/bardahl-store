SELECT cron.schedule(
  'weekly-blog-generation',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url:='https://ybjvncrqhcrsoijtxawp.supabase.co/functions/v1/blog-auto-publish',
    headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlianZuY3JxaGNyc29panR4YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjM4NTMsImV4cCI6MjA4NjU5OTg1M30.5RLQSwULOFMFjhv1GwLfBMtllsZ1ubMbDZri_Hir8F8", "Content-Type": "application/json"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);