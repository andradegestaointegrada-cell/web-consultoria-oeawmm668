CREATE TABLE public.documento_gerado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    upload_excel_id UUID NOT NULL REFERENCES public.uploads_excel(id) ON DELETE CASCADE,
    linha_numero INTEGER NOT NULL,
    arquivo_url TEXT,
    data_geracao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.documento_gerado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documento_gerado_select" ON public.documento_gerado 
    FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "documento_gerado_insert" ON public.documento_gerado 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
