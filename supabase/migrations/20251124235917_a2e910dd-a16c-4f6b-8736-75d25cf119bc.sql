-- Create storage bucket for resumes/curriculos
INSERT INTO storage.buckets (id, name, public)
VALUES ('curriculos', 'curriculos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public access to view PDFs
CREATE POLICY "Public can view curriculum PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'curriculos');

-- Policy: Authenticated users can upload their own PDFs
CREATE POLICY "Users can upload own curriculum PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'curriculos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own PDFs
CREATE POLICY "Users can delete own curriculum PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'curriculos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);