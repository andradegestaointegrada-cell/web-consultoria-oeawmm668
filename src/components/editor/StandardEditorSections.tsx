import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { Section } from '@/types/editor'

interface Props {
  secoes: Section[]
  onChange: (secoes: Section[]) => void
  isReadOnly?: boolean
}

export function StandardEditorSections({ secoes, onChange, isReadOnly }: Props) {
  const addSection = () => {
    onChange([...secoes, { id: Date.now().toString(), subtitulo: '', conteudo: '' }])
  }

  const updateSection = (id: string, field: keyof Section, value: string) => {
    onChange(secoes.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeSection = (id: string) => {
    onChange(secoes.filter((s) => s.id !== id))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Seções do Documento</CardTitle>
        {!isReadOnly && (
          <Button variant="secondary" size="sm" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Seção
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {secoes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-md border border-dashed">
            Nenhuma seção adicionada.
          </div>
        ) : (
          secoes.map((secao, index) => (
            <div
              key={secao.id}
              className="space-y-4 p-5 border rounded-lg bg-card shadow-sm relative group transition-all hover:border-border/80"
            >
              {!isReadOnly && (
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
              )}

              <div className="space-y-2 pr-12">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Seção {index + 1}
                </Label>
                <Input
                  disabled={isReadOnly}
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
                  onChange={(v) => !isReadOnly && updateSection(secao.id, 'conteudo', v)}
                  placeholder="Desenvolva o conteúdo desta seção..."
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
