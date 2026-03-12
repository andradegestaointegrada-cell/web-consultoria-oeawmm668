import { useState, useEffect } from 'react'
import { LayoutTemplate, Plus, Edit, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { EmailTemplateDialog } from '@/components/email-templates/EmailTemplateDialog'

export default function TemplatesEmail() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const fetchTemplates = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('email_templates' as any)
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })

    if (error) {
      toast.error('Erro ao buscar templates de e-mail')
    } else {
      setTemplates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template de e-mail?')) return

    try {
      const { error } = await supabase
        .from('email_templates' as any)
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Template excluído com sucesso')
      fetchTemplates()
    } catch (err: any) {
      toast.error('Erro ao excluir', { description: err.message })
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const filteredTemplates = templates.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Templates de E-mail
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie modelos de e-mail com variáveis dinâmicas para envio automatizado.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Template
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead className="w-[180px]">Data de Criação</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Carregando templates...
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum template encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.nome}</TableCell>
                    <TableCell className="truncate max-w-[300px]" title={template.assunto}>
                      {template.assunto}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(template.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmailTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
        onSuccess={fetchTemplates}
      />
    </div>
  )
}
