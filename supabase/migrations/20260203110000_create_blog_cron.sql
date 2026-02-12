-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly blog post generation (every Monday at 9:00 AM)
-- Note: This requires pg_cron to be enabled in your Supabase project
-- You can also use Supabase Edge Functions with a cron trigger instead

-- Alternative: Create a function to check and generate posts
CREATE OR REPLACE FUNCTION check_and_generate_weekly_blog()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_post_count INTEGER;
BEGIN
  -- Check if a post was created in the last 7 days
  SELECT COUNT(*) INTO recent_post_count
  FROM blog_posts
  WHERE created_at >= NOW() - INTERVAL '7 days';

  -- If no post was created, we should generate one
  -- This will be triggered by the cron job calling the edge function
  IF recent_post_count = 0 THEN
    -- Log that we need to generate a post
    INSERT INTO blog_generation_log (prompt, status)
    VALUES ('Weekly auto-generation check', 'pending');
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_generate_weekly_blog() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_generate_weekly_blog() TO service_role;
