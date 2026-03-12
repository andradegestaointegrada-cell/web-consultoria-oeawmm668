CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    arquivo_docx_url TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates" 
    ON public.templates
    FOR SELECT 
    TO authenticated
    USING (true);
