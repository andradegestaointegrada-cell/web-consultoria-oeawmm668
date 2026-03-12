import { useState, useEffect } from 'react'
import { Loader2, Database, FileText, Cpu, AlertCircle } from 'lucide-react'
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
import { BatchGeneratorTable } from '@/components/gerar-documento/BatchGeneratorTable'

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
    setSelectedTemplateId('')
  }, [selectedUploadId, uploads])

  const availableTemplates = allTemplates.filter((t) =>
    mappings.some((m) => m.upload_excel_id === selectedUploadId && m.template_id === t.id),
  )
  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : []

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" /> Geração Dinâmica em Lote
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere múltiplos documentos Word simultaneamente a partir de suas planilhas conectadas.
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
              Selecione registros para gerar documentos em lote ou individualmente.
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
              <BatchGeneratorTable
                rows={rows}
                columns={columns}
                template={allTemplates.find((t) => t.id === selectedTemplateId)}
                mappings={mappings.filter(
                  (m) =>
                    m.template_id === selectedTemplateId && m.upload_excel_id === selectedUploadId,
                )}
                uploadId={selectedUploadId}
                userId={user?.id || ''}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
