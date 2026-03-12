import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TemplateUploadDialog } from '@/components/templates/TemplateUploadDialog'
import { Badge } from '@/components/ui/badge'

export default function Templates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })

    if (error) toast.error('Erro ao buscar templates')
    else setTemplates(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDelete = async (template: any) => {
    if (!confirm(`Deseja realmente excluir o template "${template.nome}"?`)) return

    try {
      if (template.arquivo_docx_url) {
        await supabase.storage.from('templates').remove([template.arquivo_docx_url])
      }
      const { error } = await supabase.from('templates').delete().eq('id', template.id)
      if (error) throw error

      toast.success('Template excluído com sucesso!')
      fetchTemplates()
    } catch (err: any) {
      toast.error('Erro ao excluir template', { description: err.message })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Gerenciamento de Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Mantenha seus arquivos Word catalogados para geração rápida de documentos.
          </p>
        </div>
        <TemplateUploadDialog onSuccess={fetchTemplates} />
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg">Modelos Cadastrados</CardTitle>
          <CardDescription>Lista completa de arquivos disponíveis no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome do Template</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Variáveis Detectadas</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando templates...
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 mb-3 opacity-20" />
                      <p>Nenhum template cadastrado.</p>
                      <p className="text-sm mt-1">Faça o upload de um modelo para começar.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-md">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate max-w-[200px]">{template.nome}</span>
                          {template.descricao && (
                            <span
                              className="text-xs text-muted-foreground font-normal truncate max-w-[200px] mt-0.5"
                              title={template.descricao}
                            >
                              {template.descricao}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.categoria ? (
                        <Badge variant="outline" className="font-normal bg-background">
                          {template.categoria}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {template.versao ? `v${template.versao}` : 'v1.0'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {template.placeholders && template.placeholders.length > 0 ? (
                        <span className="text-sm font-medium">
                          {template.placeholders.length} campos
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(template.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
