CREATE TABLE public.auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    cliente_id UUID REFERENCES public.projeto_status(id) ON DELETE CASCADE NOT NULL,
    norma TEXT NOT NULL CHECK (norma IN ('ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO/IEC 17020', 'ISO/IEC 17025')),
    data_auditoria DATE NOT NULL,
    auditor_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida')),
    escopo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own audits" 
    ON public.auditorias
    FOR ALL
    TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

