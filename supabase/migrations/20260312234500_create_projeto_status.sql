CREATE TABLE public.projeto_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  cliente TEXT NOT NULL,
  projeto TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  percentual_concluido NUMERIC NOT NULL DEFAULT 0,
  visitas_planejadas INTEGER NOT NULL DEFAULT 0,
  visitas_realizadas INTEGER NOT NULL DEFAULT 0,
  tipo_visita TEXT CHECK (tipo_visita IN ('presencial', 'remoto')),
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('em andamento', 'concluído', 'atrasado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projeto_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project status"
  ON public.projeto_status
  FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
