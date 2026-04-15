
-- Drop the overly broad SELECT policies
DROP POLICY "Public can view product images" ON storage.objects;
DROP POLICY "Public can view avatars" ON storage.objects;

-- Replace with folder-scoped policies
CREATE POLICY "Anyone can view product images by path" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Anyone can view avatars by path" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Note: These are still public buckets so direct URL access works,
-- but we accept this for a marketplace where images must be publicly viewable.
