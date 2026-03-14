-- 1. RLS policy for anonymous blog view increment
CREATE POLICY "Allow anonymous view increment" ON public.blog_posts 
FOR UPDATE TO anon 
USING (true) 
WITH CHECK (true);

-- 2. Create blog_images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog_images', 'blog_images', true);

-- Storage policies for blog_images bucket
CREATE POLICY "Admins can upload blog images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog_images' AND public.is_admin());

CREATE POLICY "Admins can update blog images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'blog_images' AND public.is_admin())
WITH CHECK (bucket_id = 'blog_images' AND public.is_admin());

CREATE POLICY "Admins can delete blog images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'blog_images' AND public.is_admin());

CREATE POLICY "Blog images are publicly readable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'blog_images');