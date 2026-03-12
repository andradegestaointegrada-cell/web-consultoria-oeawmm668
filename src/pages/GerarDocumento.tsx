import { useState, useEffect } from 'react'
import { Loader2, Database, FileText, Cpu, Settings2 } from 'lucide-react'
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
import { BatchGeneratorTable } from '@/components/gerar-documento/BatchGeneratorTable'
import { ExcelMappingForm } from '@/components/gerar-documento/ExcelMappingForm'
import { EvolutionChart } from '@/components/gerar-documento/EvolutionChart'

export default function GerarDocumento() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<any[]>([])
  const [allTemplates, setAllTemplates] = useState<any[]>([])
  const [legacyMappings, setLegacyMappings] = useState<any[]>([])
  const [excelMappings, setExcelMappings] = useState<any[]>([])

  const [selectedUploadId, setSelectedUploadId] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const [rows, setRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRows, setIsLoadingRows] = useState(false)
  const [forceMapping, setForceMapping] = useState(false)

  const [dateCol, setDateCol] = useState<string>('')
  const [numericCols, setNumericCols] = useState<string[]>([])
  const [chartImageBase64, setChartImageBase64] = useState<string | null>(null)

  const fetchMappings = async () => {
    if (!user) return
    const [mRes, meRes] = await Promise.all([
      supabase.from('mapeamento_placeholders').select('*').eq('usuario_id', user.id),
      supabase
        .from('mapeamento_excel' as any)
        .select('*')
        .eq('usuario_id', user.id),
    ])
    if (mRes.data) setLegacyMappings(mRes.data)
    if (meRes.data) setExcelMappings(meRes.data)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setIsLoading(true)
      const [uRes, tRes] = await Promise.all([
        supabase.from('uploads_excel').select('*').eq('usuario_id', user.id).order('nome'),
        supabase.from('templates').select('*').eq('usuario_id', user.id).order('nome'),
      ])
      if (uRes.data) setUploads(uRes.data)
      if (tRes.data) setAllTemplates(tRes.data)
      await fetchMappings()
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
    setForceMapping(false)
  }, [selectedUploadId, uploads])

  useEffect(() => {
    if (rows.length > 0) {
      const first = rows[0]
      const numCols: string[] = []
      let dCol = ''
      Object.keys(first).forEach((k) => {
        const val = first[k]
        if (
          typeof val === 'number' ||
          (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')
        ) {
          numCols.push(k)
        } else if (
          (typeof val === 'string' &&
            (val.includes('-') || val.includes('/')) &&
            !isNaN(Date.parse(val))) ||
          k.toLowerCase().includes('data') ||
          k.toLowerCase().includes('date')
        ) {
          if (!dCol) dCol = k
        }
      })
      setDateCol(dCol)
      setNumericCols(numCols)
      setChartImageBase64(null)
    } else {
      setDateCol('')
      setNumericCols([])
      setChartImageBase64(null)
    }
  }, [rows])

  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : []

  const currentExcelMapping = excelMappings.find(
    (m) => m.template_id === selectedTemplateId && m.upload_excel_id === selectedUploadId,
  )
  const legacyMappingExists = legacyMappings.some(
    (m) => m.template_id === selectedTemplateId && m.upload_excel_id === selectedUploadId,
  )

  const hasAnyMapping = !!currentExcelMapping || legacyMappingExists
  const needsMapping = selectedUploadId && selectedTemplateId && (!hasAnyMapping || forceMapping)

  const activeMappings = currentExcelMapping
    ? currentExcelMapping.mapeamento_json.map((m: any) => ({
        placeholder_nome: m.placeholder,
        coluna_excel_mapeada: m.column,
        tipo_dado: m.type,
      }))
    : legacyMappings.filter(
        (m) => m.template_id === selectedTemplateId && m.upload_excel_id === selectedUploadId,
      )

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
              onValueChange={(v) => {
                setSelectedTemplateId(v)
                setForceMapping(false)
              }}
              disabled={!selectedUploadId || allTemplates.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedUploadId ? 'Selecione a base primeiro' : 'Escolha um template...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {needsMapping ? (
        <ExcelMappingForm
          template={allTemplates.find((t) => t.id === selectedTemplateId)}
          uploadId={selectedUploadId}
          columns={columns}
          onSaved={async () => {
            await fetchMappings()
            setForceMapping(false)
          }}
          onCancel={() => setForceMapping(false)}
        />
      ) : (
        selectedUploadId &&
        selectedTemplateId && (
          <Card className="shadow-sm border-border animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Registros da Planilha</CardTitle>
                <CardDescription>
                  Mapeamento ativo detectado. Selecione registros para gerar.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForceMapping(true)}
                className="shrink-0 gap-2"
              >
                <Settings2 className="h-4 w-4" /> Configurar Variáveis
              </Button>
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
                  mappings={activeMappings}
                  uploadId={selectedUploadId}
                  userId={user?.id || ''}
                  chartImageBase64={chartImageBase64}
                />
              )}
            </CardContent>
          </Card>
        )
      )}

      {dateCol && numericCols.length > 0 && selectedUploadId && !needsMapping && (
        <EvolutionChart
          data={rows}
          dateCol={dateCol}
          numericCols={numericCols}
          onImageGenerated={setChartImageBase64}
        />
      )}
    </div>
  )
}
