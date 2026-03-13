CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.projeto_status(id) ON DELETE SET NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  servico TEXT NOT NULL CHECK (servico IN ('consultoria', 'auditoria', 'treinamento')),
  valor NUMERIC NOT NULL,
  descricao TEXT NOT NULL,
  centro_custo TEXT NOT NULL,
  cnpj_cliente TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'emitida', 'paga', 'vencida')),
  data_criacao TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
