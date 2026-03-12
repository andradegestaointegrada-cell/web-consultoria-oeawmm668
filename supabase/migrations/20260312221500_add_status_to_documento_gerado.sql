ALTER TABLE public.documento_gerado ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'gerado';

DROP POLICY IF EXISTS "documento_gerado_delete" ON public.documento_gerado;
CREATE POLICY "documento_gerado_delete" ON public.documento_gerado
    FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "documento_gerado_update" ON public.documento_gerado;
CREATE POLICY "documento_gerado_update" ON public.documento_gerado
    FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
