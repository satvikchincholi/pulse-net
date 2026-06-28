-- Add image_url to community_posts
ALTER TABLE public.community_posts
ADD COLUMN image_url text;

-- Create a storage bucket for community images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('community_images', 'community_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the community_images bucket
-- Allow public viewing
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community_images' );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'community_images'
    AND auth.role() = 'authenticated'
);
