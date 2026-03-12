CREATE TABLE public.mapeamento_excel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    upload_excel_id UUID NOT NULL REFERENCES public.uploads_excel(id) ON DELETE CASCADE,
    mapeamento_json JSONB NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mapeamento_excel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mapeamento_excel_select" ON public.mapeamento_excel 
    FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_excel_insert" ON public.mapeamento_excel 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_excel_update" ON public.mapeamento_excel 
    FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_excel_delete" ON public.mapeamento_excel 
    FOR DELETE TO authenticated USING (auth.uid() = usuario_id);
