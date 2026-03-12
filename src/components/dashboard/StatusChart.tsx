import { Cell, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const data = [
  { name: 'Concluído', value: 400, color: 'hsl(var(--chart-2))' },
  { name: 'Em Andamento', value: 300, color: 'hsl(var(--chart-4))' },
  { name: 'Atrasado', value: 100, color: 'hsl(var(--chart-1))' },
]

const chartConfig = {
  Concluído: { label: 'Concluído', color: 'hsl(var(--chart-2))' },
  'Em Andamento': { label: 'Em Andamento', color: 'hsl(var(--chart-4))' },
  Atrasado: { label: 'Atrasado', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

export function StatusChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Status de Auditorias</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[300px]">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
