CREATE TABLE public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL,
    nome_cliente TEXT NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('rascunho', 'finalizado')),
    arquivo_url TEXT
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own documents"
    ON public.documentos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own documents"
    ON public.documentos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own documents"
    ON public.documentos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documentos
    FOR DELETE
    TO authenticated
    USING (auth.uid() = usuario_id);
