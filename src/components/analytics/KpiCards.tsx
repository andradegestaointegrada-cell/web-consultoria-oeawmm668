import { FileText, Send, Percent, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KpiProps {
  totalGenerated: number
  totalSent: number
}

export function KpiCards({ totalGenerated, totalSent }: KpiProps) {
  const successRate = totalGenerated > 0 ? ((totalSent / totalGenerated) * 100).toFixed(1) : '0.0'

  const stats = [
    {
      title: 'Total Gerado',
      value: totalGenerated.toString(),
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-500/20',
    },
    {
      title: 'Total Enviado',
      value: totalSent.toString(),
      icon: Send,
      color: 'text-emerald-600 dark:text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${successRate}%`,
      icon: Percent,
      color: 'text-purple-600 dark:text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-500/20',
    },
    {
      title: 'Desempenho',
      value: 'Estável',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-500/20',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
