-- Add placeholders column to templates table
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS placeholders JSONB DEFAULT '[]'::jsonb;

-- Create templates storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', false) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid duplication errors
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated to insert templates" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated to update templates" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated to read templates" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated to delete templates" ON storage.objects;
END
$$;

-- Create RLS policies for storage bucket
CREATE POLICY "Allow authenticated to insert templates" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'templates');

CREATE POLICY "Allow authenticated to update templates" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'templates');

CREATE POLICY "Allow authenticated to read templates" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'templates');

CREATE POLICY "Allow authenticated to delete templates" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'templates');
