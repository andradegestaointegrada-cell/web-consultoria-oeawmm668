import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { StatusReportTasks } from './StatusReportTasks'
import type { StatusReportContent } from '@/types/editor'

export function StatusReportEditor({ documento, onBack }: { documento: any; onBack: () => void }) {
  const isReadOnly = documento.status === 'finalizado'
  const [saving, setSaving] = useState(false)

  const [content, setContent] = useState<StatusReportContent>(() => {
    const c = documento.conteudo || {}
    return {
      project_info: {
        name: c.project_info?.name || documento.nome_cliente || '',
        consultant: c.project_info?.consultant || '',
        period: c.project_info?.period || '',
      },
      tasks: c.tasks || [],
      risks: c.risks || '',
      next_steps: c.next_steps || '',
    }
  })

  const handleSave = async () => {
    if (isReadOnly) return
    setSaving(true)
    const { error } = await supabase
      .from('documentos')
      .update({
        conteudo: content,
        nome_cliente: content.project_info.name || documento.nome_cliente,
      })
      .eq('id', documento.id)

    setSaving(false)
    if (error) toast.error('Erro ao salvar', { description: error.message })
    else toast.success('Status Report salvo com sucesso!')
  }

  const updateInfo = (field: keyof typeof content.project_info, value: string) => {
    setContent((prev) => ({
      ...prev,
      project_info: { ...prev.project_info, [field]: value },
    }))
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Status Report</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhamento de Projeto {isReadOnly && ' (Somente Leitura)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Relatório
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Projeto / Cliente</Label>
              <Input
                disabled={isReadOnly}
                value={content.project_info.name}
                onChange={(e) => updateInfo('name', e.target.value)}
                placeholder="Ex: Consultoria de Processos - Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label>Consultor Responsável</Label>
              <Input
                disabled={isReadOnly}
                value={content.project_info.consultant}
                onChange={(e) => updateInfo('consultant', e.target.value)}
                placeholder="Nome do consultor"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Período do Relatório</Label>
              <Input
                disabled={isReadOnly}
                value={content.project_info.period}
                onChange={(e) => updateInfo('period', e.target.value)}
                placeholder="Ex: 01/10/2023 a 15/10/2023"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <StatusReportTasks
              isReadOnly={isReadOnly}
              tasks={content.tasks}
              onChange={(tasks) => setContent((prev) => ({ ...prev, tasks }))}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Análise Qualitativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Riscos e Observações</Label>
              <Textarea
                disabled={isReadOnly}
                className="min-h-[100px]"
                value={content.risks}
                onChange={(e) => setContent((prev) => ({ ...prev, risks: e.target.value }))}
                placeholder="Detalhe possíveis bloqueios, riscos do projeto ou observações importantes..."
              />
            </div>
            <div className="space-y-2">
              <Label>Próximos Passos</Label>
              <Textarea
                disabled={isReadOnly}
                className="min-h-[100px]"
                value={content.next_steps}
                onChange={(e) => setContent((prev) => ({ ...prev, next_steps: e.target.value }))}
                placeholder="Ações previstas para a próxima semana ou período..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
