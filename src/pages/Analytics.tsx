import { useState, useEffect } from 'react'
import { BarChart3, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { MonthlyVolumeChart } from '@/components/analytics/MonthlyVolumeChart'
import { GenerationDeliveryChart } from '@/components/analytics/GenerationDeliveryChart'
import { TemplateDistributionChart } from '@/components/analytics/TemplateDistributionChart'
import { KpiCards } from '@/components/analytics/KpiCards'
import { ActiveClientsTable } from '@/components/analytics/ActiveClientsTable'
import {
  processMonthlyData,
  processTemplateDistribution,
  processClientRanking,
} from '@/lib/analytics-utils'

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [templateData, setTemplateData] = useState<any[]>([])
  const [clientsData, setClientsData] = useState<any[]>([])

  const [totals, setTotals] = useState({ generated: 0, sent: 0 })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)

      try {
        const [genDocsRes, stdDocsRes] = await Promise.all([
          supabase
            .from('documento_gerado')
            .select('id, data_geracao, status_envio, templates(tipo, nome)')
            .eq('usuario_id', user.id),
          supabase.from('documentos').select('nome_cliente').eq('usuario_id', user.id),
        ])

        const genDocs = genDocsRes.data || []
        const stdDocs = stdDocsRes.data || []

        setMonthlyData(processMonthlyData(genDocs))
        setTemplateData(processTemplateDistribution(genDocs))
        setClientsData(processClientRanking(stdDocs))

        const totalGenerated = genDocs.length
        const totalSent = genDocs.filter(
          (d) => d.status_envio && d.status_envio !== 'pendente',
        ).length
        setTotals({ generated: totalGenerated, sent: totalSent })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics & Performance
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitore a produtividade da fábrica de documentos e analise tendências de envios.
        </p>
      </div>

      <KpiCards totalGenerated={totals.generated} totalSent={totals.sent} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyVolumeChart data={monthlyData} />
        <GenerationDeliveryChart data={monthlyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TemplateDistributionChart data={templateData} />
        </div>
        <div className="lg:col-span-2">
          <ActiveClientsTable clients={clientsData} />
        </div>
      </div>
    </div>
  )
}
