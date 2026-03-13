// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      agendamentos_email: {
        Row: {
          created_at: string
          data_agendada: string
          destinatario: string
          documento_id: string
          hora_agendada: string
          id: string
          status: string
          template_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          data_agendada: string
          destinatario: string
          documento_id: string
          hora_agendada: string
          id?: string
          status?: string
          template_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          data_agendada?: string
          destinatario?: string
          documento_id?: string
          hora_agendada?: string
          id?: string
          status?: string
          template_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agendamentos_email_documento_id_fkey'
            columns: ['documento_id']
            isOneToOne: false
            referencedRelation: 'documento_gerado'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agendamentos_email_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'email_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agendamentos_email_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      despesas: {
        Row: {
          categoria: string
          cliente_id: string | null
          comprovante_url: string | null
          data: string
          data_criacao: string
          descricao: string
          id: string
          projeto_id: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          categoria: string
          cliente_id?: string | null
          comprovante_url?: string | null
          data: string
          data_criacao?: string
          descricao: string
          id?: string
          projeto_id?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          categoria?: string
          cliente_id?: string | null
          comprovante_url?: string | null
          data?: string
          data_criacao?: string
          descricao?: string
          id?: string
          projeto_id?: string | null
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'despesas_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projeto_status'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'despesas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      documento_gerado: {
        Row: {
          arquivo_url: string | null
          data_envio: string | null
          data_geracao: string
          id: string
          linha_numero: number
          status: string | null
          status_envio: string | null
          template_id: string
          tentativas_envio: number
          ultima_tentativa: string | null
          upload_excel_id: string
          usuario_id: string
        }
        Insert: {
          arquivo_url?: string | null
          data_envio?: string | null
          data_geracao?: string
          id?: string
          linha_numero: number
          status?: string | null
          status_envio?: string | null
          template_id: string
          tentativas_envio?: number
          ultima_tentativa?: string | null
          upload_excel_id: string
          usuario_id: string
        }
        Update: {
          arquivo_url?: string | null
          data_envio?: string | null
          data_geracao?: string
          id?: string
          linha_numero?: number
          status?: string | null
          status_envio?: string | null
          template_id?: string
          tentativas_envio?: number
          ultima_tentativa?: string | null
          upload_excel_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documento_gerado_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_upload_excel_id_fkey'
            columns: ['upload_excel_id']
            isOneToOne: false
            referencedRelation: 'uploads_excel'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_url: string | null
          conteudo: Json | null
          data_criacao: string
          id: string
          nome_cliente: string
          status: string
          tipo_documento: string
          usuario_id: string
        }
        Insert: {
          arquivo_url?: string | null
          conteudo?: Json | null
          data_criacao?: string
          id?: string
          nome_cliente: string
          status: string
          tipo_documento: string
          usuario_id: string
        }
        Update: {
          arquivo_url?: string | null
          conteudo?: Json | null
          data_criacao?: string
          id?: string
          nome_cliente?: string
          status?: string
          tipo_documento?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documentos_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      email_templates: {
        Row: {
          assunto: string
          corpo: string
          data_criacao: string
          id: string
          nome: string
          usuario_id: string
        }
        Insert: {
          assunto: string
          corpo: string
          data_criacao?: string
          id?: string
          nome: string
          usuario_id: string
        }
        Update: {
          assunto?: string
          corpo?: string
          data_criacao?: string
          id?: string
          nome?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'email_templates_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      mapeamento_excel: {
        Row: {
          data_criacao: string
          id: string
          mapeamento_json: Json
          template_id: string
          upload_excel_id: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          mapeamento_json: Json
          template_id: string
          upload_excel_id: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          id?: string
          mapeamento_json?: Json
          template_id?: string
          upload_excel_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'mapeamento_excel_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'mapeamento_excel_upload_excel_id_fkey'
            columns: ['upload_excel_id']
            isOneToOne: false
            referencedRelation: 'uploads_excel'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'mapeamento_excel_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      mapeamento_placeholders: {
        Row: {
          coluna_excel_mapeada: string
          data_criacao: string
          id: string
          placeholder_nome: string
          template_id: string
          tipo_dado: string
          upload_excel_id: string
          usuario_id: string
        }
        Insert: {
          coluna_excel_mapeada: string
          data_criacao?: string
          id?: string
          placeholder_nome: string
          template_id: string
          tipo_dado: string
          upload_excel_id: string
          usuario_id: string
        }
        Update: {
          coluna_excel_mapeada?: string
          data_criacao?: string
          id?: string
          placeholder_nome?: string
          template_id?: string
          tipo_dado?: string
          upload_excel_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'mapeamento_placeholders_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'mapeamento_placeholders_upload_excel_id_fkey'
            columns: ['upload_excel_id']
            isOneToOne: false
            referencedRelation: 'uploads_excel'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'mapeamento_placeholders_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      projeto_status: {
        Row: {
          cliente: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          orcamento_previsto: number | null
          percentual_concluido: number
          projeto: string
          responsavel_id: string
          status: string | null
          tipo_visita: string | null
          usuario_id: string
          visitas_planejadas: number
          visitas_realizadas: number
        }
        Insert: {
          cliente: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          orcamento_previsto?: number | null
          percentual_concluido?: number
          projeto: string
          responsavel_id: string
          status?: string | null
          tipo_visita?: string | null
          usuario_id: string
          visitas_planejadas?: number
          visitas_realizadas?: number
        }
        Update: {
          cliente?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          orcamento_previsto?: number | null
          percentual_concluido?: number
          projeto?: string
          responsavel_id?: string
          status?: string | null
          tipo_visita?: string | null
          usuario_id?: string
          visitas_planejadas?: number
          visitas_realizadas?: number
        }
        Relationships: [
          {
            foreignKeyName: 'projeto_status_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projeto_status_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      templates: {
        Row: {
          arquivo_docx_url: string | null
          categoria: string | null
          criado_em: string
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          nome: string
          placeholders: Json | null
          tipo: string
          usuario_id: string
          versao: number | null
        }
        Insert: {
          arquivo_docx_url?: string | null
          categoria?: string | null
          criado_em?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
          placeholders?: Json | null
          tipo: string
          usuario_id: string
          versao?: number | null
        }
        Update: {
          arquivo_docx_url?: string | null
          categoria?: string | null
          criado_em?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          placeholders?: Json | null
          tipo?: string
          usuario_id?: string
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'templates_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      uploads_excel: {
        Row: {
          arquivo_url: string | null
          colunas: Json | null
          data_atualizacao: string | null
          data_upload: string | null
          descricao: string | null
          id: string
          nome: string
          tipo_dados: string | null
          usuario_id: string
        }
        Insert: {
          arquivo_url?: string | null
          colunas?: Json | null
          data_atualizacao?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo_dados?: string | null
          usuario_id: string
        }
        Update: {
          arquivo_url?: string | null
          colunas?: Json | null
          data_atualizacao?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo_dados?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'uploads_excel_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: agendamentos_email
//   id: uuid (not null, default: gen_random_uuid())
//   documento_id: uuid (not null)
//   data_agendada: date (not null)
//   hora_agendada: time without time zone (not null)
//   template_id: uuid (not null)
//   destinatario: text (not null)
//   status: text (not null, default: 'pendente'::text)
//   usuario_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: despesas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data: date (not null)
//   categoria: text (not null)
//   valor: numeric (not null)
//   descricao: text (not null)
//   cliente_id: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   comprovante_url: text (nullable)
//   projeto_id: uuid (nullable)
// Table: documento_gerado
//   id: uuid (not null, default: gen_random_uuid())
//   template_id: uuid (not null)
//   upload_excel_id: uuid (not null)
//   linha_numero: integer (not null)
//   arquivo_url: text (nullable)
//   data_geracao: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (not null)
//   status: text (nullable, default: 'gerado'::text)
//   status_envio: text (nullable, default: 'pendente'::text)
//   data_envio: timestamp with time zone (nullable)
//   tentativas_envio: integer (not null, default: 0)
//   ultima_tentativa: timestamp with time zone (nullable)
// Table: documentos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tipo_documento: text (not null)
//   nome_cliente: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   status: text (not null)
//   arquivo_url: text (nullable)
//   conteudo: jsonb (nullable, default: '{}'::jsonb)
// Table: email_templates
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   assunto: text (not null)
//   corpo: text (not null)
//   usuario_id: uuid (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: mapeamento_excel
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   template_id: uuid (not null)
//   upload_excel_id: uuid (not null)
//   mapeamento_json: jsonb (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: mapeamento_placeholders
//   id: uuid (not null, default: gen_random_uuid())
//   template_id: uuid (not null)
//   upload_excel_id: uuid (not null)
//   usuario_id: uuid (not null)
//   placeholder_nome: text (not null)
//   coluna_excel_mapeada: text (not null)
//   tipo_dado: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: projeto_status
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   cliente: text (not null)
//   projeto: text (not null)
//   data_inicio: date (not null)
//   data_fim: date (not null)
//   percentual_concluido: numeric (not null, default: 0)
//   visitas_planejadas: integer (not null, default: 0)
//   visitas_realizadas: integer (not null, default: 0)
//   tipo_visita: text (nullable)
//   responsavel_id: uuid (not null)
//   status: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   orcamento_previsto: numeric (nullable, default: 0)
// Table: templates
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   tipo: text (not null)
//   arquivo_docx_url: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   placeholders: jsonb (nullable, default: '[]'::jsonb)
//   usuario_id: uuid (not null)
//   categoria: text (nullable)
//   descricao: text (nullable)
//   versao: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: uploads_excel
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   descricao: text (nullable)
//   tipo_dados: text (nullable)
//   data_upload: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
//   arquivo_url: text (nullable)
//   colunas: jsonb (nullable, default: '[]'::jsonb)
// Table: usuarios
//   id: uuid (not null)
//   email: text (not null)
//   nome: text (not null)
//   role: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: agendamentos_email
//   FOREIGN KEY agendamentos_email_documento_id_fkey: FOREIGN KEY (documento_id) REFERENCES documento_gerado(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_email_pkey: PRIMARY KEY (id)
//   CHECK agendamentos_email_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'enviado'::text, 'erro'::text])))
//   FOREIGN KEY agendamentos_email_template_id_fkey: FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE
//   FOREIGN KEY agendamentos_email_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: despesas
//   CHECK despesas_categoria_check: CHECK ((categoria = ANY (ARRAY['transporte'::text, 'hospedagem'::text, 'alimentação'::text, 'material'::text, 'outros'::text])))
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY despesas_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projeto_status(id) ON DELETE SET NULL
//   FOREIGN KEY despesas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: documento_gerado
//   PRIMARY KEY documento_gerado_pkey: PRIMARY KEY (id)
//   FOREIGN KEY documento_gerado_template_id_fkey: FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
//   FOREIGN KEY documento_gerado_upload_excel_id_fkey: FOREIGN KEY (upload_excel_id) REFERENCES uploads_excel(id) ON DELETE CASCADE
//   FOREIGN KEY documento_gerado_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: documentos
//   PRIMARY KEY documentos_pkey: PRIMARY KEY (id)
//   CHECK documentos_status_check: CHECK ((status = ANY (ARRAY['rascunho'::text, 'finalizado'::text])))
//   FOREIGN KEY documentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: email_templates
//   PRIMARY KEY email_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY email_templates_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: mapeamento_excel
//   PRIMARY KEY mapeamento_excel_pkey: PRIMARY KEY (id)
//   FOREIGN KEY mapeamento_excel_template_id_fkey: FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
//   FOREIGN KEY mapeamento_excel_upload_excel_id_fkey: FOREIGN KEY (upload_excel_id) REFERENCES uploads_excel(id) ON DELETE CASCADE
//   FOREIGN KEY mapeamento_excel_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: mapeamento_placeholders
//   PRIMARY KEY mapeamento_placeholders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY mapeamento_placeholders_template_id_fkey: FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
//   FOREIGN KEY mapeamento_placeholders_upload_excel_id_fkey: FOREIGN KEY (upload_excel_id) REFERENCES uploads_excel(id) ON DELETE CASCADE
//   FOREIGN KEY mapeamento_placeholders_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: projeto_status
//   PRIMARY KEY projeto_status_pkey: PRIMARY KEY (id)
//   FOREIGN KEY projeto_status_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK projeto_status_status_check: CHECK ((status = ANY (ARRAY['em andamento'::text, 'concluído'::text, 'atrasado'::text])))
//   CHECK projeto_status_tipo_visita_check: CHECK ((tipo_visita = ANY (ARRAY['presencial'::text, 'remoto'::text])))
//   FOREIGN KEY projeto_status_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: templates
//   PRIMARY KEY templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY templates_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: uploads_excel
//   PRIMARY KEY uploads_excel_pkey: PRIMARY KEY (id)
//   FOREIGN KEY uploads_excel_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   CHECK usuarios_role_check: CHECK ((role = ANY (ARRAY['admin'::text, 'consultor'::text, 'viewer'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agendamentos_email
//   Policy "agendamentos_email_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "agendamentos_email_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "agendamentos_email_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "agendamentos_email_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: despesas
//   Policy "Users can manage their own expenses" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: documento_gerado
//   Policy "documento_gerado_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "documento_gerado_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "documento_gerado_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "documento_gerado_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: documentos
//   Policy "Users can delete their own documents" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "Users can insert their own documents" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Users can select their own documents" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "Users can update their own documents" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: email_templates
//   Policy "email_templates_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = usuario_id)
//   Policy "email_templates_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "email_templates_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = usuario_id)
//   Policy "email_templates_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: mapeamento_excel
//   Policy "mapeamento_excel_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "mapeamento_excel_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "mapeamento_excel_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "mapeamento_excel_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: mapeamento_placeholders
//   Policy "mapeamento_placeholders_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "mapeamento_placeholders_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "mapeamento_placeholders_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "mapeamento_placeholders_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: projeto_status
//   Policy "Users can manage their own project status" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: templates
//   Policy "templates_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "templates_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "templates_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "templates_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: uploads_excel
//   Policy "uploads_excel_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "uploads_excel_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "uploads_excel_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "uploads_excel_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: usuarios
//   Policy "Users can update their own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can view their own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)

// --- DATABASE FUNCTIONS ---
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
