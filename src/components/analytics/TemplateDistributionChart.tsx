import { Cell, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

export function TemplateDistributionChart({ data }: { data: any[] }) {
  const chartConfig = data.reduce(
    (acc, curr) => {
      acc[curr.name] = { label: curr.name, color: curr.fill }
      return acc
    },
    {} as Record<string, any>,
  ) satisfies ChartConfig

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Template</CardTitle>
        <CardDescription>Tipos de modelos mais utilizados</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center pb-6">
        {data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground border rounded-md border-dashed">
            Sem dados disponíveis
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <ChartLegend content={<ChartLegendContent className="flex-wrap gap-2" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
