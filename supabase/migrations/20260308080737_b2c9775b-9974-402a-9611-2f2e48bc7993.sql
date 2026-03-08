
-- Add unsubscribe_token to blog_subscribers
ALTER TABLE public.blog_subscribers 
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

-- Update existing rows without token
UPDATE public.blog_subscribers SET unsubscribe_token = encode(extensions.gen_random_bytes(16), 'hex') WHERE unsubscribe_token IS NULL;

-- Add unique constraint
ALTER TABLE public.blog_subscribers ADD CONSTRAINT blog_subscribers_unsubscribe_token_key UNIQUE (unsubscribe_token);

-- Allow admins to update blog_subscribers (for unsubscribe)
CREATE POLICY "Admins can update blog subscribers" ON public.blog_subscribers FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Allow anyone to update their own subscription via token (for unsubscribe)
CREATE POLICY "Anyone can unsubscribe via token" ON public.blog_subscribers FOR UPDATE USING (true) WITH CHECK (true);
