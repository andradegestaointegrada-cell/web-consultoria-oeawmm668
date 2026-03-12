import { useState, useEffect } from 'react'
import { Link2, Loader2, Save, AlertTriangle, FileText, Database } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function MapeamentoPlaceholders() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [uploads, setUploads] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedUploadId, setSelectedUploadId] = useState<string>('')

  const [placeholders, setPlaceholders] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mappings, setMappings] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(true)
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setIsLoading(true)

      const [templatesRes, uploadsRes] = await Promise.all([
        supabase.from('templates').select('*').eq('usuario_id', user.id).order('nome'),
        supabase.from('uploads_excel').select('*').eq('usuario_id', user.id).order('nome'),
      ])

      if (templatesRes.data) setTemplates(templatesRes.data)
      if (uploadsRes.data) setUploads(uploadsRes.data)

      setIsLoading(false)
    }

    fetchData()
  }, [user])

  useEffect(() => {
    if (!selectedTemplateId) {
      setPlaceholders([])
      return
    }

    const template = templates.find((t) => t.id === selectedTemplateId)
    if (!template || !template.arquivo_docx_url) return

    const parseTemplate = async () => {
      setIsParsing(true)
      try {
        const { data, error } = await supabase.functions.invoke('parse-word-placeholders', {
          body: { path: template.arquivo_docx_url },
        })

        if (error) throw error

        if (data && data.placeholders) {
          setPlaceholders(data.placeholders)
        }
      } catch (err: any) {
        toast.error('Erro ao analisar template', { description: err.message })
        setPlaceholders([])
      } finally {
        setIsParsing(false)
      }
    }

    parseTemplate()
  }, [selectedTemplateId, templates])

  useEffect(() => {
    if (!selectedUploadId) {
      setColumns([])
      return
    }
    const upload = uploads.find((u) => u.id === selectedUploadId)
    if (upload && upload.colunas && Array.isArray(upload.colunas)) {
      setColumns(upload.colunas)
    } else {
      setColumns([])
    }
  }, [selectedUploadId, uploads])

  useEffect(() => {
    if (!selectedTemplateId || !selectedUploadId || !user) {
      setMappings({})
      return
    }

    const loadMappings = async () => {
      const { data, error } = await supabase
        .from('mapeamento_placeholders')
        .select('*')
        .eq('template_id', selectedTemplateId)
        .eq('upload_excel_id', selectedUploadId)
        .eq('usuario_id', user.id)

      if (data && !error) {
        const newMappings: Record<string, string> = {}
        data.forEach((m: any) => {
          newMappings[m.placeholder_nome] = m.coluna_excel_mapeada
        })
        setMappings(newMappings)
      }
    }

    loadMappings()
  }, [selectedTemplateId, selectedUploadId, user])

  const handleSave = async () => {
    if (!selectedTemplateId || !selectedUploadId || !user) return
    setIsSaving(true)

    try {
      await supabase
        .from('mapeamento_placeholders')
        .delete()
        .eq('template_id', selectedTemplateId)
        .eq('upload_excel_id', selectedUploadId)
        .eq('usuario_id', user.id)

      const inserts = Object.entries(mappings)
        .filter(([_, col]) => col)
        .map(([ph, col]) => {
          const phData = placeholders.find((p) => p.nome_placeholder === ph)
          return {
            template_id: selectedTemplateId,
            upload_excel_id: selectedUploadId,
            usuario_id: user.id,
            placeholder_nome: ph,
            coluna_excel_mapeada: col,
            tipo_dado: phData?.tipo_dado || 'text',
          }
        })

      if (inserts.length > 0) {
        const { error } = await supabase.from('mapeamento_placeholders').insert(inserts)
        if (error) throw error
      }

      toast.success('Mapeamento salvo com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao salvar', { description: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const unmappedCount = placeholders.filter((p) => !mappings[p.nome_placeholder]).length

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            Conectar Dados
          </h1>
          <p className="text-muted-foreground mt-1">
            Mapeie variáveis de seus templates com colunas de bases de dados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              1. Selecione o Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um template DOCX..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
                {templates.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhum template encontrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              2. Selecione a Base de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUploadId} onValueChange={setSelectedUploadId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma fonte de dados..." />
              </SelectTrigger>
              <SelectContent>
                {uploads.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
                {uploads.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhuma base encontrada
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {isParsing && (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analisando variáveis do template...
        </div>
      )}

      {!isParsing && placeholders.length > 0 && selectedUploadId && (
        <Card className="shadow-sm animate-slide-up border-border">
          <CardHeader>
            <CardTitle>Mapeamento de Variáveis</CardTitle>
            <CardDescription>
              Associe as variáveis detectadas no documento às colunas da sua planilha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {unmappedCount > 0 && (
              <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Existem {unmappedCount} {unmappedCount === 1 ? 'variável' : 'variáveis'} não
                  mapeadas. Campos em branco podem causar erros na geração do documento.
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">Variável no Documento</TableHead>
                    <TableHead>Coluna Equivalente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placeholders.map((p) => {
                    const isMapped = !!mappings[p.nome_placeholder]
                    return (
                      <TableRow
                        key={p.nome_placeholder}
                        className={cn(!isMapped && 'bg-amber-50/30 dark:bg-amber-950/10')}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isMapped ? 'secondary' : 'outline'}
                              className={cn(
                                'font-mono font-normal tracking-tight',
                                !isMapped &&
                                  'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
                              )}
                            >
                              {`{{${p.nome_placeholder}}}`}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mappings[p.nome_placeholder] || ''}
                            onValueChange={(val) => {
                              if (val === 'unmapped_clear') {
                                setMappings((prev) => {
                                  const newMap = { ...prev }
                                  delete newMap[p.nome_placeholder]
                                  return newMap
                                })
                              } else {
                                setMappings((prev) => ({ ...prev, [p.nome_placeholder]: val }))
                              }
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                'w-full max-w-[300px]',
                                !isMapped &&
                                  'border-amber-300 dark:border-amber-700/50 focus:ring-amber-400',
                              )}
                            >
                              <SelectValue placeholder="Selecione uma coluna..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="unmapped_clear"
                                className="text-muted-foreground italic"
                              >
                                Nenhuma coluna
                              </SelectItem>
                              {columns.map((col) => (
                                <SelectItem key={col} value={col}>
                                  {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {placeholders.length - unmappedCount} de {placeholders.length} variáveis mapeadas
            </span>
            <Button onClick={handleSave} disabled={isSaving} className="min-w-[200px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Mapeamento
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isParsing && placeholders.length === 0 && selectedTemplateId && (
        <div className="text-center p-12 text-muted-foreground border rounded-lg bg-card border-dashed">
          Nenhuma variável detectada neste documento.
        </div>
      )}
    </div>
  )
}
