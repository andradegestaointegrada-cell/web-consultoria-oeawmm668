import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { month: 'Jan', documents: 186, audits: 80 },
  { month: 'Fev', documents: 305, audits: 200 },
  { month: 'Mar', documents: 237, audits: 120 },
  { month: 'Abr', documents: 73, audits: 190 },
  { month: 'Mai', documents: 209, audits: 130 },
  { month: 'Jun', documents: 214, audits: 140 },
]

const chartConfig = {
  documents: { label: 'Documentos', color: 'hsl(var(--primary))' },
  audits: { label: 'Auditorias', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

export function ActivityChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Atividade Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="documents" fill="var(--color-documents)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="audits" fill="var(--color-audits)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
