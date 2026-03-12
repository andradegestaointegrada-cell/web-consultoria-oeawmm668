import { useAuth } from '@/contexts/AuthContext'
import { StatCards } from '@/components/dashboard/StatCards'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const recentActivities = [
  { id: 1, action: 'Relatório de Auditoria gerado', user: 'Maria Silva', time: 'Há 2 horas' },
  {
    id: 2,
    action: 'Nova auditoria iniciada: Tech Corp',
    user: 'João Consultor',
    time: 'Há 4 horas',
  },
  { id: 3, action: 'Contrato atualizado', user: 'Ana Paula', time: 'Há 5 horas' },
  { id: 4, action: 'Configurações de sistema alteradas', user: 'Admin', time: 'Ontem' },
]

export default function Index() {
  const { user } = useAuth()
  const today = format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Aqui está o resumo das suas atividades hoje.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border shadow-sm text-sm font-medium">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {today}
        </div>
      </div>

      <StatCards />

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        <div className="md:col-span-4 lg:col-span-2">
          <ActivityChart />
        </div>
        <div className="md:col-span-3 lg:col-span-1">
          <StatusChart />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">Por {activity.user}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
