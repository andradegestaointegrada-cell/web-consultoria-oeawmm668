import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, AlertCircle, Clock, Wallet } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

interface FinancialDashboardProps {
  invoices: any[]
  loading: boolean
}

const chartConfig = {
  projetada: { label: 'Receita Projetada', color: '#6366f1' }, // indigo-500
  realizada: { label: 'Receita Realizada', color: '#10b981' }, // emerald-500
}

const pieConfig = {
  Paga: { label: 'Paga', color: '#10b981' },
  Emitida: { label: 'Emitida', color: '#3b82f6' },
  Vencida: { label: 'Vencida', color: '#ef4444' },
  Rascunho: { label: 'Rascunho', color: '#94a3b8' },
}

export function FinancialDashboard({ invoices, loading }: FinancialDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const filteredInvoices = useMemo(() => {
    if (!dateRange?.from) return invoices
    return invoices.filter((inv) => {
      if (!inv.data_vencimento && !inv.data_emissao) return false
      const invDate = parseISO(inv.data_vencimento || inv.data_emissao)
      if (dateRange.from && invDate < dateRange.from) return false
      if (dateRange.to && invDate > dateRange.to) return false
      return true
    })
  }, [invoices, dateRange])

  const kpis = useMemo(() => {
    let realized = 0
    let projected = 0
    let pending = 0
    let overdue = 0

    filteredInvoices.forEach((inv) => {
      const val = Number(inv.valor) || 0
      projected += val
      if (inv.status === 'paga') realized += val
      if (inv.status === 'emitida') pending += val
      if (inv.status === 'vencida') overdue += val
    })

    return { realized, projected, pending, overdue }
  }, [filteredInvoices])

  const chartData = useMemo(() => {
    const map = new Map<
      string,
      { month: string; sortKey: string; projetada: number; realizada: number }
    >()

    filteredInvoices.forEach((inv) => {
      if (!inv.data_vencimento && !inv.data_emissao) return
      const date = parseISO(inv.data_vencimento || inv.data_emissao)
      const monthKey = format(date, 'MMM/yy', { locale: ptBR })
      const sortKey = format(date, 'yyyy-MM')

      if (!map.has(monthKey)) {
        map.set(monthKey, { month: monthKey, sortKey, projetada: 0, realizada: 0 })
      }

      const val = Number(inv.valor) || 0
      const data = map.get(monthKey)!
      data.projetada += val
      if (inv.status === 'paga') {
        data.realizada += val
      }
    })

    return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [filteredInvoices])

  const statusData = useMemo(() => {
    const statuses = [
      { name: 'Paga', value: 0, color: '#10b981' },
      { name: 'Emitida', value: 0, color: '#3b82f6' },
      { name: 'Vencida', value: 0, color: '#ef4444' },
      { name: 'Rascunho', value: 0, color: '#94a3b8' },
    ]

    filteredInvoices.forEach((inv) => {
      const val = Number(inv.valor) || 0
      if (inv.status === 'paga') statuses[0].value += val
      else if (inv.status === 'emitida') statuses[1].value += val
      else if (inv.status === 'vencida') statuses[2].value += val
      else statuses[3].value += val
    })

    return statuses.filter((s) => s.value > 0)
  }, [filteredInvoices])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Visão Geral Financeira</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas receitas e projeções</p>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Realizada</p>
              <h3 className="text-2xl font-bold">{formatCurrency(kpis.realized)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Projetada</p>
              <h3 className="text-2xl font-bold">{formatCurrency(kpis.projected)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendente (Emitidas)</p>
              <h3 className="text-2xl font-bold">{formatCurrency(kpis.pending)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Atraso (Vencidas)</p>
              <h3 className="text-2xl font-bold">{formatCurrency(kpis.overdue)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Realizado vs Projetado</CardTitle>
            <CardDescription>Comparativo mensal de faturamento</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado financeiro para o período selecionado.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => `R$ ${value >= 1000 ? value / 1000 + 'k' : value}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(val: number) => formatCurrency(val)} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="projetada"
                    fill="var(--color-projetada)"
                    radius={[4, 4, 0, 0]}
                    name="Projetada"
                  />
                  <Bar
                    dataKey="realizada"
                    fill="var(--color-realizada)"
                    radius={[4, 4, 0, 0]}
                    name="Realizada"
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Valores totais por situação da fatura</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {statusData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para exibir.
              </div>
            ) : (
              <div className="flex flex-col gap-6 items-center">
                <ChartContainer config={pieConfig} className="h-[200px] w-full aspect-auto">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(val: number) => formatCurrency(val)}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>

                <div className="w-full flex flex-col gap-2 px-2">
                  {statusData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span>{s.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
