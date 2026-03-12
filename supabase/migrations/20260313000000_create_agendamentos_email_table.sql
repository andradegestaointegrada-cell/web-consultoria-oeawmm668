CREATE TABLE IF NOT EXISTS public.agendamentos_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES public.documento_gerado(id) ON DELETE CASCADE,
    data_agendada DATE NOT NULL,
    hora_agendada TIME NOT NULL,
    template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
    destinatario TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_email_status_check'
    ) THEN
        ALTER TABLE public.agendamentos_email ADD CONSTRAINT agendamentos_email_status_check CHECK (status IN ('pendente', 'enviado', 'erro'));
    END IF;
END $$;

ALTER TABLE public.agendamentos_email ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "agendamentos_email_select" ON public.agendamentos_email;
    CREATE POLICY "agendamentos_email_select" ON public.agendamentos_email FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

    DROP POLICY IF EXISTS "agendamentos_email_insert" ON public.agendamentos_email;
    CREATE POLICY "agendamentos_email_insert" ON public.agendamentos_email FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

    DROP POLICY IF EXISTS "agendamentos_email_update" ON public.agendamentos_email;
    CREATE POLICY "agendamentos_email_update" ON public.agendamentos_email FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

    DROP POLICY IF EXISTS "agendamentos_email_delete" ON public.agendamentos_email;
    CREATE POLICY "agendamentos_email_delete" ON public.agendamentos_email FOR DELETE TO authenticated USING (auth.uid() = usuario_id);
END $$;
