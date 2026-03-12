-- Add columns for email dispatch tracking
ALTER TABLE public.documento_gerado ADD COLUMN IF NOT EXISTS status_envio TEXT DEFAULT 'pendente';
ALTER TABLE public.documento_gerado ADD COLUMN IF NOT EXISTS data_envio TIMESTAMPTZ;

-- Create bucket for generated documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated_docs', 'generated_docs', false) 
ON CONFLICT (id) DO NOTHING;

-- Policies for storage to allow users to interact with their generated documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Usuarios podem ver seus documentos gerados'
    ) THEN
        CREATE POLICY "Usuarios podem ver seus documentos gerados" ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = 'generated_docs' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Usuarios podem inserir seus documentos gerados'
    ) THEN
        CREATE POLICY "Usuarios podem inserir seus documentos gerados" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'generated_docs' AND auth.uid() = owner);
    END IF;
END
$$;
