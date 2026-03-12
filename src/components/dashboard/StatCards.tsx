import { FileText, Clock, Users, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  {
    title: 'Documentos Gerados',
    value: '1.284',
    description: '+12% em relação ao mês anterior',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    title: 'Auditorias Pendentes',
    value: '14',
    description: '3 críticas requerem atenção',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    title: 'Clientes Ativos',
    value: '342',
    description: '+4 novos clientes esta semana',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    title: 'Taxa de Conformidade',
    value: '94%',
    description: 'Média global das auditorias',
    icon: Activity,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
]

export function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="hover:-translate-y-1 transition-transform duration-300 shadow-sm">
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
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
