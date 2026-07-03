
ALTER TABLE public.timeline_items ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE POLICY "public read cv-attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cv-attachments');

CREATE POLICY "admin insert cv-attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cv-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update cv-attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cv-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete cv-attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cv-attachments' AND public.has_role(auth.uid(), 'admin'));
