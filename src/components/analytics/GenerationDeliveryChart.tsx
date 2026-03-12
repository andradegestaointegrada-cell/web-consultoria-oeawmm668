import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

export function GenerationDeliveryChart({ data }: { data: any[] }) {
  const chartConfig = {
    generated: { label: 'Gerados', color: 'hsl(var(--chart-1))' },
    sent: { label: 'Enviados', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig

  return (
    <Card className="shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Geração vs. Entrega</CardTitle>
        <CardDescription>
          Comparativo mensal de documentos criados e enviados com sucesso
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-md border-dashed">
            Sem dados no período
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="generated"
                fill="var(--color-generated)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
