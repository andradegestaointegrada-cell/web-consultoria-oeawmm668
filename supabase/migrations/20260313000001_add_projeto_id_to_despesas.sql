DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas' AND column_name = 'projeto_id') THEN
        ALTER TABLE public.despesas ADD COLUMN projeto_id UUID REFERENCES public.projeto_status(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas' AND column_name = 'comprovante_url') THEN
        ALTER TABLE public.despesas ADD COLUMN comprovante_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projeto_status' AND column_name = 'orcamento_previsto') THEN
        ALTER TABLE public.projeto_status ADD COLUMN orcamento_previsto NUMERIC DEFAULT 0;
    END IF;
END $$;
