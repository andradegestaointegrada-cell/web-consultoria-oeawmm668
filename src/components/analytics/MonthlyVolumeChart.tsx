import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function MonthlyVolumeChart({ data }: { data: any[] }) {
  const chartConfig = {
    generated: { label: 'Gerados', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig

  return (
    <Card className="shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Volume de Geração</CardTitle>
        <CardDescription>Documentos gerados ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-md border-dashed">
            Sem dados no período
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="generated"
                stroke="var(--color-generated)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
