import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import type { PlaceholderMapping } from '@/types/editor'

export function TemplateUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [file, setFile] = useState<File | null>(null)
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [versao, setVersao] = useState('1.0')
  const [loading, setLoading] = useState(false)
  const [placeholders, setPlaceholders] = useState<string[]>([])
  const [mappings, setMappings] = useState<Record<string, Omit<PlaceholderMapping, 'name'>>>({})
  const [uploadedPath, setUploadedPath] = useState('')

  const reset = () => {
    setStep(1)
    setFile(null)
    setNome('')
    setCategoria('')
    setDescricao('')
    setVersao('1.0')
    setPlaceholders([])
    setMappings({})
    setUploadedPath('')
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) reset()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (!selected.name.endsWith('.docx')) {
        toast.error('Apenas arquivos .docx são permitidos')
        return
      }
      setFile(selected)
      if (!nome) setNome(selected.name.replace('.docx', ''))
    }
  }

  const handleUploadAndParse = async () => {
    if (!file || !nome) return toast.error('Preencha o nome e selecione o arquivo.')
    if (!user) return
    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('templates').upload(path, file)
      if (uploadError) throw uploadError

      setUploadedPath(path)

      const { data, error: parseError } = await supabase.functions.invoke('parse_docx', {
        body: { path },
      })
      if (parseError) throw parseError

      setPlaceholders(data.placeholders || [])

      const initMap: Record<string, Omit<PlaceholderMapping, 'name'>> = {}
      ;(data.placeholders || []).forEach((p: string) => {
        initMap[p] = { type: 'text', mappedField: 'none' }
      })
      setMappings(initMap)
      setStep(2)
    } catch (error: any) {
      toast.error('Erro no processamento', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const placeholdersToSave = placeholders.map((p) => ({
        name: p,
        ...mappings[p],
      }))

      const { error } = await supabase.from('templates').insert({
        nome,
        categoria,
        descricao,
        versao: versao ? parseFloat(versao) : 1.0,
        tipo: 'Word',
        arquivo_docx_url: uploadedPath,
        placeholders: placeholdersToSave as any,
        usuario_id: user?.id,
      })

      if (error) throw error

      toast.success('Template salvo com sucesso!')
      handleOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error('Erro ao salvar template', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Cadastrar Template' : 'Mapeamento de Variáveis'}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Insira as propriedades do modelo e faça o upload do arquivo base.'
              : 'Verifique as variáveis encontradas no documento e defina o auto-preenchimento.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  placeholder="Ex: Relatório Mensal"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Versão</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria do Documento</Label>
                <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Status Report">Status Report</SelectItem>
                    <SelectItem value="Proposta">Proposta Comercial</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Auditoria">Auditoria</SelectItem>
                    <SelectItem value="Contrato">Contrato</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Arquivo Word (.docx)</Label>
                <Input type="file" accept=".docx" onChange={handleFileChange} disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição Breve</Label>
              <Input
                placeholder="Para que serve este template?"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {placeholders.length > 0 ? (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {placeholders.map((p) => (
                  <div
                    key={p}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-md bg-muted/30"
                  >
                    <div className="md:col-span-1 flex items-center font-medium">
                      <code className="text-sm bg-muted px-2 py-1 rounded text-primary truncate max-w-full">
                        {`{{${p}}}`}
                      </code>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Tipo de Dado</Label>
                      <Select
                        value={mappings[p]?.type}
                        onValueChange={(v: any) =>
                          setMappings((prev) => ({ ...prev, [p]: { ...prev[p], type: v } }))
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto Curto</SelectItem>
                          <SelectItem value="longtext">Texto Longo</SelectItem>
                          <SelectItem value="date">Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Preenchimento</Label>
                      <Select
                        value={mappings[p]?.mappedField}
                        onValueChange={(v) =>
                          setMappings((prev) => ({ ...prev, [p]: { ...prev[p], mappedField: v } }))
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Manual</SelectItem>
                          <SelectItem value="nome_cliente">Nome do Cliente</SelectItem>
                          <SelectItem value="data_atual">Data Atual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-2 opacity-20" />
                <p>
                  Nenhuma variável (<code>{'{{variavel}}'}</code>) detectada.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button onClick={handleUploadAndParse} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Arquivo
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finalizar Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
