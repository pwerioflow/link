-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('logos', 'logos', true),
  ('downloads', 'downloads', true);

-- Create storage policies for logos bucket
CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Create storage policies for downloads bucket
CREATE POLICY "Users can upload downloads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update downloads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete downloads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'downloads');
