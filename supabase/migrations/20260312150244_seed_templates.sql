INSERT INTO public.templates (id, nome, tipo, arquivo_docx_url, criado_em)
VALUES
  (gen_random_uuid(), 'Template Padrão de Proposta Comercial', 'Proposta Comercial', NULL, NOW()),
  (gen_random_uuid(), 'Template Padrão de Relatório de Auditoria', 'Relatório de Auditoria', NULL, NOW()),
  (gen_random_uuid(), 'Template Padrão de Manual', 'Manual', NULL, NOW()),
  (gen_random_uuid(), 'Template Padrão de Procedimentos', 'Procedimentos', NULL, NOW()),
  (gen_random_uuid(), 'Template Padrão de Instrução de Trabalho', 'Instrução de Trabalho', NULL, NOW());
