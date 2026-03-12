import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { HistoryFilters } from '@/components/historico/HistoryFilters'
import { HistoryTable, HistoricoDoc } from '@/components/historico/HistoryTable'
import { HistoryDetailsDialog } from '@/components/historico/HistoryDetailsDialog'

const PAGE_SIZE = 10

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function HistoricoDocumentos() {
  const { user } = useAuth()
  const [data, setData] = useState<HistoricoDoc[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounceValue(searchTerm, 500)
  const [templateFilter, setTemplateFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)

  const [templates, setTemplates] = useState<{ id: string; nome: string }[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<HistoricoDoc | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('templates')
        .select('id, nome')
        .eq('usuario_id', user.id)
        .order('nome')
      if (data) setTemplates(data)
    }
    fetchTemplates()
  }, [user])

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return
      setLoading(true)

      let query = supabase
        .from('documento_gerado')
        .select('*, templates(nome)', { count: 'exact' })
        .eq('usuario_id', user.id)
        .order('data_geracao', { ascending: false })

      if (debouncedSearch) {
        const num = parseInt(debouncedSearch)
        if (!isNaN(num)) {
          query = query.eq('linha_numero', num - 1)
        }
      }

      if (templateFilter && templateFilter !== 'all') {
        query = query.eq('template_id', templateFilter)
      }

      if (showErrorsOnly) {
        query = query.eq('status_envio', 'erro')
      }

      if (dateRange?.from) {
        query = query.gte('data_geracao', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to)
        toDate.setDate(toDate.getDate() + 1)
        query = query.lt('data_geracao', toDate.toISOString())
      }

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data: responseData, count, error } = await query

      if (error) {
        toast.error('Erro ao carregar histórico')
      } else {
        setData((responseData as HistoricoDoc[]) || [])
        setTotalCount(count || 0)
      }
      setLoading(false)
    }

    loadHistory()
  }, [user, debouncedSearch, templateFilter, dateRange, page, showErrorsOnly])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro do histórico?')) return
    try {
      const { error } = await supabase.from('documento_gerado').delete().eq('id', id)
      if (error) throw error
      toast.success('Registro excluído com sucesso')
      setData(data.filter((d) => d.id !== id))
      setTotalCount((prev) => prev - 1)
    } catch (err: any) {
      toast.error('Erro ao excluir', { description: err.message })
    }
  }

  const handleDownload = async (url: string | null) => {
    if (!url) {
      toast.error('Arquivo não disponível para download')
      return
    }
    if (url.startsWith('http')) {
      window.open(url, '_blank')
      return
    }
    try {
      const { data, error } = await supabase.storage.from('documentos').createSignedUrl(url, 60)
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      } else {
        window.open(url, '_blank')
      }
    } catch (err) {
      window.open(url, '_blank')
    }
  }

  const handleRetry = async (doc: HistoricoDoc) => {
    setRetryingId(doc.id)
    try {
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos_email')
        .select('destinatario, template_id')
        .eq('documento_id', doc.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (agendamentoError || !agendamento) {
        toast.error('Destinatário não encontrado para este documento.')
        setRetryingId(null)
        return
      }

      const { data: template } = await supabase
        .from('email_templates')
        .select('assunto, corpo')
        .eq('id', agendamento.template_id)
        .single()

      const res = await supabase.functions.invoke('send-email-document', {
        body: {
          documentIds: [doc.id],
          email: agendamento.destinatario,
          subject: template?.assunto || 'Reenvio de Documento',
          message: template?.corpo || 'Segue o documento reenviado.',
        },
      })

      const success = !res.error && res.data?.success
      const newTentativas = (doc.tentativas_envio || 0) + 1
      const newStatus = success ? 'enviado' : 'erro'
      const nowISO = new Date().toISOString()

      await supabase
        .from('documento_gerado')
        .update({
          tentativas_envio: newTentativas,
          ultima_tentativa: nowISO,
          status_envio: newStatus,
        })
        .eq('id', doc.id)

      if (success) {
        toast.success('Documento reenviado com sucesso!')
      } else {
        toast.error('Falha ao reenviar documento.', { description: res.error?.message })
      }

      setData((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                tentativas_envio: newTentativas,
                status_envio: newStatus,
                ultima_tentativa: nowISO,
              }
            : d,
        ),
      )
    } catch (err: any) {
      toast.error('Erro ao processar reenvio', { description: err.message })
    } finally {
      setRetryingId(null)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Histórico de Documentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe todos os documentos gerados, gerencie falhas de envio e baixe arquivos.
        </p>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <HistoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            templateFilter={templateFilter}
            setTemplateFilter={(val) => {
              setTemplateFilter(val)
              setPage(0)
            }}
            dateRange={dateRange}
            setDateRange={(val) => {
              setDateRange(val)
              setPage(0)
            }}
            templates={templates}
            showErrorsOnly={showErrorsOnly}
            setShowErrorsOnly={(val) => {
              setShowErrorsOnly(val)
              setPage(0)
            }}
          />

          <HistoryTable
            data={data}
            loading={loading}
            page={page}
            totalPages={totalPages}
            retryingId={retryingId}
            onPageChange={setPage}
            onViewDetails={(doc) => {
              setSelectedDoc(doc)
              setIsDetailsOpen(true)
            }}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </CardContent>
      </Card>

      <HistoryDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        doc={selectedDoc}
        userId={user?.id || ''}
      />
    </div>
  )
}
