import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Save, ArrowLeft, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { exportToWord } from '@/lib/word-export'
import { DocumentPreviewDialog } from './DocumentPreviewDialog'
import { StandardEditorSections } from './StandardEditorSections'
import type { StandardContent } from '@/types/editor'

export function StandardEditor({ documento, onBack }: { documento: any; onBack: () => void }) {
  const isReadOnly = documento.status === 'finalizado'
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [content, setContent] = useState<StandardContent>(() => {
    const data = documento.conteudo || {}
    return {
      titulo: data.titulo || `${documento.nome_cliente} - ${documento.tipo_documento}`,
      introducao: data.introducao || '',
      secoes: data.secoes || [],
      conclusao: data.conclusao || '',
    }
  })

  const handleSave = async () => {
    if (isReadOnly) return
    setSaving(true)
    const { error } = await supabase
      .from('documentos')
      .update({ conteudo: content, status: 'rascunho' })
      .eq('id', documento.id)

    setSaving(false)
    if (error) toast.error('Erro ao salvar rascunho', { description: error.message })
    else toast.success('Rascunho salvo com sucesso!')
  }

  const handleExportWord = async () => {
    setExporting(true)
    try {
      exportToWord(content)
      toast.success('Documento exportado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar documento para Word.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editor de Documento</h1>
            <p className="text-sm text-muted-foreground">
              {documento.nome_cliente} • {documento.tipo_documento}
              {isReadOnly && ' (Somente Leitura)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportWord} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Exportar como Word
          </Button>
          <DocumentPreviewDialog content={content} />
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Rascunho
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informações Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Título do Documento</Label>
              <Input
                disabled={isReadOnly}
                value={content.titulo}
                onChange={(e) => setContent((c) => ({ ...c, titulo: e.target.value }))}
                placeholder="Ex: Proposta Comercial"
                className="text-lg font-medium h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Introdução</Label>
              <RichTextEditor
                value={content.introducao}
                onChange={(v) => !isReadOnly && setContent((c) => ({ ...c, introducao: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <StandardEditorSections
          isReadOnly={isReadOnly}
          secoes={content.secoes}
          onChange={(secoes) => setContent((c) => ({ ...c, secoes }))}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RichTextEditor
                value={content.conclusao}
                onChange={(v) => !isReadOnly && setContent((c) => ({ ...c, conclusao: v }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
