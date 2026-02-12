-- Check if 'products' storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'products';

-- Check bucket policies
SELECT * FROM storage.objects WHERE bucket_id = 'products' LIMIT 5;

-- Create bucket if it doesn't exist (run this if needed)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('products', 'products', true);

-- Set public access policy for products bucket
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
