-- Create media_folders table
CREATE TABLE IF NOT EXISTS public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON public.media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON public.media_folders(path);

-- Create enhanced media table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
  alt_text TEXT,
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_folder ON public.media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON public.media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON public.media_files USING GIN(tags);

-- Enable RLS
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Add missing values to app_role enum if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'editor';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'viewer' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'viewer';
  END IF;
END $$;

-- RLS Policies for media_folders
CREATE POLICY "Authenticated users can view folders"
  ON public.media_folders FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and editors can manage folders"
  ON public.media_folders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

-- RLS Policies for media_files
CREATE POLICY "Public can view published media"
  ON public.media_files FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media_files FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and editors can manage media"
  ON public.media_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

-- Create default folders
INSERT INTO public.media_folders (name, path) VALUES
  ('Products', '/products'),
  ('Blog', '/blog'),
  ('Categories', '/categories'),
  ('General', '/general')
ON CONFLICT DO NOTHING;
