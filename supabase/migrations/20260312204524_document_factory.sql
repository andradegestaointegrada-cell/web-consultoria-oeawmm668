-- 1. Database Schema Updates: Table templates
ALTER TABLE public.templates 
    ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS categoria TEXT,
    ADD COLUMN IF NOT EXISTS descricao TEXT,
    ADD COLUMN IF NOT EXISTS versao NUMERIC,
    ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ DEFAULT now();

-- Handle existing data for NOT NULL constraint on usuario_id
DO $$
BEGIN
    UPDATE public.templates SET usuario_id = (SELECT id FROM public.usuarios LIMIT 1) WHERE usuario_id IS NULL;
    DELETE FROM public.templates WHERE usuario_id IS NULL;
END $$;

ALTER TABLE public.templates ALTER COLUMN usuario_id SET NOT NULL;

-- 2. New Database Table: uploads_excel
CREATE TABLE IF NOT EXISTS public.uploads_excel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo_dados TEXT,
    data_upload TIMESTAMPTZ DEFAULT now(),
    data_atualizacao TIMESTAMPTZ DEFAULT now(),
    arquivo_url TEXT,
    colunas JSONB DEFAULT '[]'::jsonb
);

-- 3. Supabase Storage Configuration
-- Ensure templates bucket exists and is private
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO NOTHING;

-- Create excel_uploads bucket as public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('excel_uploads', 'excel_uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads_excel ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on templates to replace them cleanly and enforce strict isolation
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'templates'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.templates', pol.policyname);
    END LOOP;
END
$$;

-- Policies for templates
CREATE POLICY "templates_select" ON public.templates FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "templates_update" ON public.templates FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "templates_delete" ON public.templates FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Policies for uploads_excel
CREATE POLICY "uploads_excel_select" ON public.uploads_excel FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "uploads_excel_insert" ON public.uploads_excel FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "uploads_excel_update" ON public.uploads_excel FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "uploads_excel_delete" ON public.uploads_excel FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Storage Buckets RLS

-- Cleanup existing storage policies for these buckets to avoid conflicts
DROP POLICY IF EXISTS "templates_select_own" ON storage.objects;
DROP POLICY IF EXISTS "templates_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "templates_update_own" ON storage.objects;
DROP POLICY IF EXISTS "templates_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "excel_uploads_select_own" ON storage.objects;
DROP POLICY IF EXISTS "excel_uploads_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "excel_uploads_update_own" ON storage.objects;
DROP POLICY IF EXISTS "excel_uploads_delete_own" ON storage.objects;

-- Policies for templates bucket objects
CREATE POLICY "templates_select_own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'templates' AND auth.uid() = owner);
CREATE POLICY "templates_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'templates' AND auth.uid() = owner);
CREATE POLICY "templates_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'templates' AND auth.uid() = owner);
CREATE POLICY "templates_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'templates' AND auth.uid() = owner);

-- Policies for excel_uploads bucket objects
CREATE POLICY "excel_uploads_select_own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'excel_uploads' AND auth.uid() = owner);
CREATE POLICY "excel_uploads_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'excel_uploads' AND auth.uid() = owner);
CREATE POLICY "excel_uploads_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'excel_uploads' AND auth.uid() = owner);
CREATE POLICY "excel_uploads_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'excel_uploads' AND auth.uid() = owner);
