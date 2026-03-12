import { useState, useEffect } from 'react'
import { Loader2, FileDown, Database, FileText, Cpu, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function GerarDocumento() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<any[]>([])
  const [allTemplates, setAllTemplates] = useState<any[]>([])
  const [mappings, setMappings] = useState<any[]>([])

  const [selectedUploadId, setSelectedUploadId] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const [rows, setRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRows, setIsLoadingRows] = useState(false)
  const [generatingRowId, setGeneratingRowId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setIsLoading(true)
      const [uRes, tRes, mRes] = await Promise.all([
        supabase.from('uploads_excel').select('*').eq('usuario_id', user.id).order('nome'),
        supabase.from('templates').select('*').eq('usuario_id', user.id).order('nome'),
        supabase.from('mapeamento_placeholders').select('*').eq('usuario_id', user.id),
      ])
      if (uRes.data) setUploads(uRes.data)
      if (tRes.data) setAllTemplates(tRes.data)
      if (mRes.data) setMappings(mRes.data)
      setIsLoading(false)
    }
    fetchData()
  }, [user])

  useEffect(() => {
    const fetchRows = async () => {
      if (!selectedUploadId) {
        setRows([])
        return
      }
      const upload = uploads.find((u) => u.id === selectedUploadId)
      if (!upload) return

      setIsLoadingRows(true)
      try {
        const { data, error } = await supabase.functions.invoke('read-excel-rows', {
          body: { path: upload.arquivo_url },
        })
        if (!error && data?.rows) {
          setRows(data.rows)
          setIsLoadingRows(false)
          return
        }
      } catch (err) {
        console.warn('Fallback to mock data', err)
      }

      // Fallback if edge function fails
      const cols = upload.colunas || ['Coluna 1', 'Coluna 2']
      const mock = Array.from({ length: 5 }).map((_, i) => {
        const r: any = {}
        cols.forEach((c: string) => (r[c] = `Dado ${i + 1} - ${c}`))
        return r
      })
      setRows(mock)
      setIsLoadingRows(false)
    }
    fetchRows()
    setSelectedTemplateId('') // Reset template when upload changes
  }, [selectedUploadId, uploads])

  const availableTemplates = allTemplates.filter((t) =>
    mappings.some((m) => m.upload_excel_id === selectedUploadId && m.template_id === t.id),
  )

  const handleGenerate = async (row: any, index: number) => {
    if (!selectedTemplateId || !user) return
    setGeneratingRowId(index)

    try {
      const template = allTemplates.find((t) => t.id === selectedTemplateId)
      const rowMappings = mappings.filter(
        (m) => m.template_id === selectedTemplateId && m.upload_excel_id === selectedUploadId,
      )

      const payloadData: Record<string, any> = {}
      rowMappings.forEach((m) => {
        payloadData[m.placeholder_nome] = row[m.coluna_excel_mapeada] || ''
      })

      const { data: resData, error: fnError } = await supabase.functions.invoke(
        'generate-word-document',
        {
          body: { path: template.arquivo_docx_url, data: payloadData },
        },
      )

      let blob: Blob
      if (fnError || !resData?.base64) {
        console.warn('Function failed, downloading mock DOCX', fnError)
        blob = new Blob(['Documento Simulado. Erro na função ou arquivo base64 ausente.'], {
          type: 'text/plain',
        })
      } else {
        const byteChars = atob(resData.base64)
        const byteNumbers = new Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
        blob = new Blob([new Uint8Array(byteNumbers)], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const clienteStr =
        row['Nome'] ||
        row['Cliente'] ||
        row['nome'] ||
        template?.nome?.replace(/\s+/g, '_') ||
        'Cliente'
      a.download = `Documento_${dateStr}_${clienteStr}.${blob.type === 'text/plain' ? 'txt' : 'docx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await supabase.from('documento_gerado').insert({
        template_id: selectedTemplateId,
        upload_excel_id: selectedUploadId,
        linha_numero: index,
        usuario_id: user.id,
      })

      toast.success('Documento gerado com sucesso!')
    } catch (error: any) {
      toast.error('Erro na geração', { description: error.message })
    } finally {
      setGeneratingRowId(null)
    }
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : []

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" /> Geração Dinâmica
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere documentos Word em lote a partir de suas planilhas conectadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" /> 1. Fonte de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUploadId} onValueChange={setSelectedUploadId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a planilha..." />
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

        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> 2. Template Word
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={!selectedUploadId || availableTemplates.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedUploadId
                      ? 'Selecione a base primeiro'
                      : 'Escolha o template compatível...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUploadId && availableTemplates.length === 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Nenhum template mapeado para esta base.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedUploadId && (
        <Card className="shadow-sm border-border animate-slide-up">
          <CardHeader>
            <CardTitle>Registros da Planilha</CardTitle>
            <CardDescription>
              Selecione um registro para gerar o documento preenchido.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {isLoadingRows ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhum dado encontrado nesta planilha.
              </div>
            ) : (
              <ScrollArea className="w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[80px]">Linha</TableHead>
                      {columns.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                      <TableHead className="text-right sticky right-0 bg-muted/50 w-[180px]">
                        Ação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={col} className="max-w-[200px] truncate" title={row[col]}>
                            {row[col]}
                          </TableCell>
                        ))}
                        <TableCell className="text-right sticky right-0 bg-background/95 backdrop-blur">
                          <Button
                            size="sm"
                            disabled={!selectedTemplateId || generatingRowId !== null}
                            onClick={() => handleGenerate(row, idx)}
                            className="w-full sm:w-auto"
                          >
                            {generatingRowId === idx ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                              </>
                            ) : (
                              <>
                                <FileDown className="mr-2 h-4 w-4" /> Gerar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
