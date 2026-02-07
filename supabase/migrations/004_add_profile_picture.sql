-- Add profile picture column to nurse_profiles
ALTER TABLE nurse_profiles 
ADD COLUMN profile_picture_url TEXT;

-- Create storage bucket for profile pictures if it doesn't exist
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('profile-pictures', 'profile-pictures', true)
-- ON CONFLICT (id) DO NOTHING;

-- Create policy for profile pictures bucket
-- CREATE POLICY "Profile pictures are publicly accessible"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'profile-pictures');

-- CREATE POLICY "Users can upload their own profile pictures"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'profile-pictures' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Users can update their own profile pictures"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'profile-pictures' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Users can delete their own profile pictures"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'profile-pictures' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );