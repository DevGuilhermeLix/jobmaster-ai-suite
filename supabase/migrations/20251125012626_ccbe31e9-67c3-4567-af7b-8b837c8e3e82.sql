-- Add new columns to resumes table for PDF history
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS html_preview text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id_created_at 
ON public.resumes(user_id, created_at DESC);