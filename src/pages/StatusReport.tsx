import { useState, useEffect } from 'react'
import { Activity, Search, Filter, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { DateRange } from 'react-day-picker'

const chartConfig = {
  planned: { label: 'Planejadas', color: '#2dd4bf' },
  realized: { label: 'Realizadas', color: '#fbbf24' },
}

export default function StatusReport() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([])

  const [clienteFilter, setClienteFilter] = useState('')
  const [responsavelFilter, setResponsavelFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('usuarios').select('id, nome').order('nome')
      if (data) setUsuarios(data)
    }
    fetchUsers()
  }, [])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const filters: any = {}
      if (clienteFilter) filters.cliente = clienteFilter
      if (responsavelFilter && responsavelFilter !== 'all')
        filters.responsavel_id = responsavelFilter
      if (dateRange?.from) filters.data_inicio = dateRange.from.toISOString().split('T')[0]
      if (dateRange?.to) filters.data_fim = dateRange.to.toISOString().split('T')[0]

      const res = await supabase.functions.invoke('generate-status-report', {
        body: { action: 'fetch', filters },
      })

      if (res.error) throw res.error

      setData(res.data.tableData || [])
      setChartData(res.data.chartData || [])
    } catch (error: any) {
      toast.error('Erro ao buscar dados do relatório', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleExportExcel = async () => {
    setExportingExcel(true)
    try {
      const filters: any = {}
      if (clienteFilter) filters.cliente = clienteFilter
      if (responsavelFilter && responsavelFilter !== 'all')
        filters.responsavel_id = responsavelFilter
      if (dateRange?.from) filters.data_inicio = dateRange.from.toISOString().split('T')[0]
      if (dateRange?.to) filters.data_fim = dateRange.to.toISOString().split('T')[0]

      const res = await supabase.functions.invoke('generate-status-report', {
        body: { action: 'export_excel', filters },
      })

      if (res.error) throw res.error

      const base64 = res.data.excelBase64
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Status_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Relatório Excel exportado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao exportar Excel', { description: error.message })
    } finally {
      setExportingExcel(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'concluído')
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent shadow-none">
          Concluído
        </Badge>
      )
    if (status === 'em andamento')
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent shadow-none">
          Em Andamento
        </Badge>
      )
    if (status === 'atrasado')
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-transparent shadow-none">
          Atrasado
        </Badge>
      )
    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <style>{`
        @media print {
          body { background-color: white !important; }
          .print-hidden { display: none !important; }
          [data-sidebar="sidebar"], [data-sidebar="header"], header, nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .overflow-y-auto, .overflow-hidden { overflow: visible !important; }
          .h-svh, .h-screen, .min-h-screen { height: auto !important; min-height: auto !important; }
          .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .chart-container { break-inside: avoid; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Relatório de Status
          </h1>
          <p className="text-muted-foreground mt-1 print-hidden">
            Visão gerencial consolidada de todos os projetos ativos e concluídos.
          </p>
        </div>
        <div className="flex items-center gap-2 print-hidden">
          <Button variant="outline" onClick={handleExportExcel} disabled={exportingExcel}>
            {exportingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
            )}
            Excel
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <FileText className="h-4 w-4 mr-2 text-rose-600" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-sm print-hidden border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Cliente..."
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="w-full md:w-[220px]">
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Consultores</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <Button onClick={fetchData} disabled={loading} className="w-full md:w-auto shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Filter className="mr-2 h-4 w-4" />
              )}
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border chart-container">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Visitas Planejadas vs. Realizadas</CardTitle>
          <CardDescription>
            Acompanhamento analítico por cliente do progresso de visitas estipuladas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado para exibir no gráfico.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cliente" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="planned"
                  fill="var(--color-planned)"
                  radius={[4, 4, 0, 0]}
                  name="Visitas Planejadas"
                />
                <Bar
                  dataKey="realized"
                  fill="var(--color-realized)"
                  radius={[4, 4, 0, 0]}
                  name="Visitas Realizadas"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Progresso dos Projetos</CardTitle>
          <CardDescription className="print-hidden">
            Detalhamento de entregas, progresso percentual e status atual.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                <TableHead className="font-semibold text-foreground">Projeto</TableHead>
                <TableHead className="font-semibold text-foreground">Início / Fim</TableHead>
                <TableHead className="font-semibold text-foreground w-[180px]">Progresso</TableHead>
                <TableHead className="font-semibold text-foreground text-center">
                  Visitas (P/R)
                </TableHead>
                <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                <TableHead className="font-semibold text-foreground">Responsável</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Nenhum projeto encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                      {row.cliente}
                    </TableCell>
                    <TableCell>{row.projeto}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="font-medium">
                          {row.data_inicio ? format(new Date(row.data_inicio), 'dd/MM/yyyy') : '-'}
                        </span>
                        <span className="text-muted-foreground">
                          {row.data_fim ? format(new Date(row.data_fim), 'dd/MM/yyyy') : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={Number(row.percentual_concluido)} className="h-2 flex-1" />
                        <span className="text-xs font-semibold tabular-nums w-8">
                          {row.percentual_concluido}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium tabular-nums">
                      {row.visitas_planejadas}{' '}
                      <span className="text-muted-foreground font-normal mx-1">/</span>{' '}
                      {row.visitas_realizadas}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize font-normal text-xs">
                        {row.tipo_visita}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{row.responsavel_nome}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
