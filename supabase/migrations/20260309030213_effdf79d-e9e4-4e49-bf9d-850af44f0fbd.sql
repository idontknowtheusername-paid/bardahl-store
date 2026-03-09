
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL DEFAULT '/',
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Admins can read page views
CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (is_admin());

-- Index for monthly queries
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at);
