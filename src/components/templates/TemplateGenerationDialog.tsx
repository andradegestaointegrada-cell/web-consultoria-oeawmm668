import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wand2, Loader2, FileDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PlaceholderMapping } from '@/types/editor'

export function TemplateGenerationDialog({ documento }: { documento: any }) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      supabase
        .from('templates')
        .select('*')
        .order('nome')
        .then(({ data }) => {
          if (data) setTemplates(data)
        })
    }
  }, [open])

  const selectedTemplate = templates.find((t) => t.id === selectedId)

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.placeholders) {
      const initData: Record<string, any> = {}
      selectedTemplate.placeholders.forEach((p: PlaceholderMapping) => {
        if (p.mappedField === 'nome_cliente') {
          initData[p.name] = documento.nome_cliente || ''
        } else if (p.mappedField === 'data_atual') {
          initData[p.name] = new Date().toLocaleDateString('pt-BR')
        } else {
          initData[p.name] = ''
        }
      })
      setFormData(initData)
    }
  }, [selectedTemplate, documento])

  const handleGenerate = async () => {
    if (!selectedTemplate) return
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate_docx', {
        body: { path: selectedTemplate.arquivo_docx_url, data: formData },
      })

      if (error) throw error
      if (!data?.base64) throw new Error('Retorno inválido do servidor')

      const link = document.createElement('a')
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.base64}`
      link.download = `${selectedTemplate.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
      link.click()

      toast.success('Documento gerado com sucesso!')
      setOpen(false)
    } catch (error: any) {
      toast.error('Erro ao gerar', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="shadow-sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Gerar Word Customizado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Gerar a partir de Template</DialogTitle>
          <DialogDescription>
            Selecione um template pré-configurado e preencha as variáveis para gerar um arquivo Word
            perfeito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Selecione o Template</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate &&
            selectedTemplate.placeholders &&
            selectedTemplate.placeholders.length > 0 && (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pt-2">
                <div className="mb-2 text-sm font-medium text-muted-foreground border-b pb-2">
                  Variáveis do Template
                </div>
                {selectedTemplate.placeholders.map((p: PlaceholderMapping) => (
                  <div key={p.name} className="space-y-1.5">
                    <Label className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 rounded text-primary">{p.name}</code>
                      {p.mappedField !== 'none' && (
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                          (Auto-preenchido)
                        </span>
                      )}
                    </Label>
                    {p.type === 'longtext' ? (
                      <Textarea
                        value={formData[p.name] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [p.name]: e.target.value }))
                        }
                        className="min-h-[80px]"
                      />
                    ) : (
                      <Input
                        type={p.type === 'date' ? 'date' : 'text'}
                        value={formData[p.name] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [p.name]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

          {selectedTemplate &&
            (!selectedTemplate.placeholders || selectedTemplate.placeholders.length === 0) && (
              <div className="p-4 bg-muted/50 rounded-md text-sm text-center text-muted-foreground">
                Este template não possui variáveis. Ele será baixado exatamente como foi enviado.
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedTemplate}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Gerar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
