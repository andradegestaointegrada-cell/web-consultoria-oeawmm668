ALTER TABLE public.documento_gerado 
ADD COLUMN tentativas_envio INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ultima_tentativa TIMESTAMPTZ;
