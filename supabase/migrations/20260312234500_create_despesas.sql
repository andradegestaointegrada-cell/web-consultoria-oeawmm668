CREATE TABLE public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('transporte', 'hospedagem', 'alimentação', 'material', 'outros')),
    valor NUMERIC NOT NULL,
    descricao TEXT NOT NULL,
    cliente_id TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses" 
    ON public.despesas
    FOR ALL
    TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);
