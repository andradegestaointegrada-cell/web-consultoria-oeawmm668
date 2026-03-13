ALTER TABLE public.projeto_status ADD COLUMN orcamento_previsto NUMERIC DEFAULT 0;
ALTER TABLE public.despesas ADD COLUMN comprovante_url TEXT;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes', 'comprovantes', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Comprovantes are public accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'comprovantes');

CREATE POLICY "Users can upload comprovantes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'comprovantes' AND auth.uid() = owner);

CREATE POLICY "Users can update comprovantes" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'comprovantes' AND auth.uid() = owner);

CREATE POLICY "Users can delete comprovantes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'comprovantes' AND auth.uid() = owner);
