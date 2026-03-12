import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = {
  transporte: '#3b82f6',
  hospedagem: '#10b981',
  alimentação: '#f59e0b',
  material: '#8b5cf6',
  outros: '#6b7280',
}

export function ExpenseCharts({ expenses }: { expenses: any[] }) {
  const pieData = useMemo(() => {
    const grouped = expenses.reduce(
      (acc, curr) => {
        acc[curr.categoria] = (acc[curr.categoria] || 0) + Number(curr.valor)
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const barData = useMemo(() => {
    const grouped = expenses.reduce(
      (acc, curr) => {
        const month = curr.data.substring(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + Number(curr.valor)
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => {
        const [y, m] = month.split('-')
        const labels = [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ]
        return {
          rawMonth: month,
          month: `${labels[parseInt(m) - 1]}/${y.substring(2)}`,
          total,
        }
      })
  }, [expenses])

  const pieConfig = {
    transporte: { label: 'Transporte', color: COLORS.transporte },
    hospedagem: { label: 'Hospedagem', color: COLORS.hospedagem },
    alimentação: { label: 'Alimentação', color: COLORS.alimentação },
    material: { label: 'Material', color: COLORS.material },
    outros: { label: 'Outros', color: COLORS.outros },
    value: { label: 'Valor' },
  }

  const barConfig = {
    total: { label: 'Total (R$)', color: '#2dd4bf' },
  }

  if (expenses.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-hidden">
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.outros}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(v))
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `R$ ${v}`} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(v))
                      }
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
