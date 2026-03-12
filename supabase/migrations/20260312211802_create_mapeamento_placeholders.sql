CREATE TABLE public.mapeamento_placeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    upload_excel_id UUID NOT NULL REFERENCES public.uploads_excel(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    placeholder_nome TEXT NOT NULL,
    coluna_excel_mapeada TEXT NOT NULL,
    tipo_dado TEXT NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mapeamento_placeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mapeamento_placeholders_select" ON public.mapeamento_placeholders 
    FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_placeholders_insert" ON public.mapeamento_placeholders 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_placeholders_update" ON public.mapeamento_placeholders 
    FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "mapeamento_placeholders_delete" ON public.mapeamento_placeholders 
    FOR DELETE TO authenticated USING (auth.uid() = usuario_id);
