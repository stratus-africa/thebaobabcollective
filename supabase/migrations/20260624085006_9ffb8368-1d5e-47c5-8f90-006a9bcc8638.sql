
-- Allow service role to manage planning-guides bucket
CREATE POLICY "Service role manages planning guide files"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'planning-guides')
  WITH CHECK (bucket_id = 'planning-guides');

-- Admins can read planning guide files directly
CREATE POLICY "Admins read planning guide files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'planning-guides' AND public.has_role(auth.uid(), 'admin'));
