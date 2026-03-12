import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft, Plus, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Section {
  id: string
  subtitulo: string
  conteudo: string
}

interface EditorContent {
  titulo: string
  introducao: string
  secoes: Section[]
  conclusao: string
}

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [documento, setDocumento] = useState<any>(null)

  const [content, setContent] = useState<EditorContent>({
    titulo: '',
    introducao: '',
    secoes: [],
    conclusao: '',
  })

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id || !user) return

      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .single()

      if (error || !data) {
        toast.error('Documento não encontrado')
        navigate('/documentos')
        return
      }

      setDocumento(data)

      if (data.conteudo && Object.keys(data.conteudo).length > 0) {
        setContent({
          titulo: data.conteudo.titulo || `${data.nome_cliente} - ${data.tipo_documento}`,
          introducao: data.conteudo.introducao || '',
          secoes: data.conteudo.secoes || [],
          conclusao: data.conteudo.conclusao || '',
        })
      } else {
        setContent({
          titulo: `${data.nome_cliente} - ${data.tipo_documento}`,
          introducao: '',
          secoes: [],
          conclusao: '',
        })
      }

      setLoading(false)
    }

    fetchDoc()
  }, [id, user, navigate])

  const handleSave = async () => {
    if (!id || !user) return

    setSaving(true)
    const { error } = await supabase
      .from('documentos')
      .update({
        conteudo: content,
        status: 'rascunho',
      })
      .eq('id', id)
      .eq('usuario_id', user.id)

    setSaving(false)

    if (error) {
      toast.error('Erro ao salvar rascunho', { description: error.message })
    } else {
      toast.success('Rascunho salvo com sucesso!')
    }
  }

  const addSection = () => {
    setContent((prev) => ({
      ...prev,
      secoes: [...prev.secoes, { id: Date.now().toString(), subtitulo: '', conteudo: '' }],
    }))
  }

  const updateSection = (secId: string, field: keyof Section, value: string) => {
    setContent((prev) => ({
      ...prev,
      secoes: prev.secoes.map((s) => (s.id === secId ? { ...s, [field]: value } : s)),
    }))
  }

  const removeSection = (secId: string) => {
    setContent((prev) => ({
      ...prev,
      secoes: prev.secoes.filter((s) => s.id !== secId),
    }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/documentos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editor de Documento</h1>
            <p className="text-sm text-muted-foreground">
              {documento?.nome_cliente} • {documento?.tipo_documento}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-muted/20">
              <DialogHeader className="p-6 pb-4 bg-background border-b z-10">
                <DialogTitle>Visualização do Documento</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-slate dark:prose-invert max-w-none bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12 min-h-full mx-auto max-w-[800px]">
                  <h1>{content.titulo}</h1>
                  <div dangerouslySetInnerHTML={{ __html: content.introducao }} />
                  {content.secoes.map((s) => (
                    <div key={s.id} className="mt-8">
                      <h2>{s.subtitulo}</h2>
                      <div dangerouslySetInnerHTML={{ __html: s.conteudo }} />
                    </div>
                  ))}
                  <div className="mt-8" dangerouslySetInnerHTML={{ __html: content.conclusao }} />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Rascunho
          </Button>
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
                value={content.titulo}
                onChange={(e) => setContent((c) => ({ ...c, titulo: e.target.value }))}
                placeholder="Ex: Proposta Comercial de Consultoria"
                className="text-lg font-medium h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Introdução</Label>
              <RichTextEditor
                value={content.introducao}
                onChange={(v) => setContent((c) => ({ ...c, introducao: v }))}
                placeholder="Escreva a introdução do documento..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Seções do Documento</CardTitle>
            <Button variant="secondary" size="sm" onClick={addSection}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Seção
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.secoes.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-md border border-dashed">
                Nenhuma seção adicionada. Clique no botão acima para começar.
              </div>
            ) : (
              content.secoes.map((secao, index) => (
                <div
                  key={secao.id}
                  className="space-y-4 p-5 border rounded-lg bg-card shadow-sm relative group transition-all hover:border-border/80"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeSection(secao.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 pr-12">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                      Seção {index + 1}
                    </Label>
                    <Input
                      value={secao.subtitulo}
                      onChange={(e) => updateSection(secao.id, 'subtitulo', e.target.value)}
                      placeholder="Ex: Escopo do Projeto"
                      className="font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conteúdo da Seção</Label>
                    <RichTextEditor
                      value={secao.conteudo}
                      onChange={(v) => updateSection(secao.id, 'conteudo', v)}
                      placeholder="Desenvolva o conteúdo desta seção..."
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RichTextEditor
                value={content.conclusao}
                onChange={(v) => setContent((c) => ({ ...c, conclusao: v }))}
                placeholder="Escreva as considerações finais e próximos passos..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
