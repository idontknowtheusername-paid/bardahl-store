-- =====================================================
-- BLOG SUBSCRIBERS SYSTEM
-- Table for blog email notifications
-- =====================================================

-- Create blog_subscribers table
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_active ON public.blog_subscribers(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can subscribe"
    ON public.blog_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
    ON public.blog_subscribers
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Users can unsubscribe"
    ON public.blog_subscribers
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can manage all subscriptions"
    ON public.blog_subscribers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE users.id = auth.uid()
            AND users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Function to notify subscribers when a blog post is published
CREATE OR REPLACE FUNCTION notify_blog_subscribers()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed to 'published'
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
        -- Call edge function to send emails (async via pg_net or similar)
        PERFORM net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/blog-notify-subscribers',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
                'blog_post_id', NEW.id,
                'title', NEW.title,
                'slug', NEW.slug,
                'excerpt', NEW.excerpt
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on blog_posts
DROP TRIGGER IF EXISTS trigger_notify_blog_subscribers ON public.blog_posts;
CREATE TRIGGER trigger_notify_blog_subscribers
    AFTER INSERT OR UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION notify_blog_subscribers();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_subscribers_updated_at
    BEFORE UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_subscribers_updated_at();

COMMENT ON TABLE public.blog_subscribers IS 'Stores email addresses of users who want to receive blog notifications';
COMMENT ON COLUMN public.blog_subscribers.unsubscribe_token IS 'Unique token for unsubscribe links';
