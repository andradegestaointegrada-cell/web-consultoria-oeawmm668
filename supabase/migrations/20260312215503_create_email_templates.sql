CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_select" ON email_templates FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "email_templates_insert" ON email_templates FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "email_templates_delete" ON email_templates FOR DELETE USING (auth.uid() = usuario_id);
