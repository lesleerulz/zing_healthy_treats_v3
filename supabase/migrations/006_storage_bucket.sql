-- Create a new storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

-- Policy to allow the admin to upload product images
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'products' AND (auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com'
);

-- Policy to allow the admin to update product images
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'products' AND (auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com'
);

-- Policy to allow the admin to delete product images
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'products' AND (auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com'
);
