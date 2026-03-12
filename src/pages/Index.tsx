import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, PlusCircle, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  const { profile, user } = useAuth()
  const today = format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })

  const displayName = profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'

  const [recentDocs, setRecentDocs] = useState<any[]>([])
  const [currentMonthCount, setCurrentMonthCount] = useState<number | null>(null)
  const [prevMonthCount, setPrevMonthCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      // Recent docs
      const { data: docs } = await supabase
        .from('documentos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(5)

      if (docs) setRecentDocs(docs)

      const now = new Date()
      const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const { count: currentCount } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .gte('data_criacao', startOfCurrent.toISOString())

      const { count: prevCount } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .gte('data_criacao', startOfPrev.toISOString())
        .lt('data_criacao', startOfCurrent.toISOString())

      setCurrentMonthCount(currentCount || 0)
      setPrevMonthCount(prevCount || 0)
    }

    loadDashboardData()
  }, [user])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Olá, {displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo do seu desempenho e atividades.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-card px-4 py-2 rounded-md border border-border shadow-sm text-sm font-medium text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {today}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos este mês
            </CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{currentMonthCount ?? '-'}</div>
            {prevMonthCount !== null && currentMonthCount !== null && (
              <p
                className={cn(
                  'text-sm mt-2 font-medium w-fit px-2 py-0.5 rounded-md',
                  currentMonthCount >= prevMonthCount
                    ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10',
                )}
              >
                {currentMonthCount >= prevMonthCount ? '+' : ''}
                {currentMonthCount - prevMonthCount} em relação ao mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2 flex items-center bg-card relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <CardContent className="flex flex-col sm:flex-row items-center justify-between w-full p-6 sm:p-8 gap-6 relative z-10">
            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-foreground">Pronto para começar?</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Acesse a fábrica de documentos para gerar propostas, relatórios e manuais
                rapidamente.
              </p>
            </div>
            <Button
              size="lg"
              className="shrink-0 h-12 px-6 text-base shadow-md hover:shadow-lg transition-all"
              asChild
            >
              <Link to="/documentos">
                <PlusCircle className="mr-2 h-5 w-5" />
                Criar Novo Documento
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Atividade Recente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seus últimos documentos criados no sistema.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-muted-foreground">Cliente</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-[200px]">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground w-[120px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right w-[150px]">
                  Data de Criação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum documento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                recentDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        {doc.nome_cliente}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="border-transparent bg-muted">
                        {doc.tipo_documento}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          doc.status === 'rascunho'
                            ? 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50'
                            : 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50'
                        }
                      >
                        {doc.status === 'rascunho' ? 'Rascunho' : 'Finalizado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">
                      {doc.data_criacao
                        ? format(new Date(doc.data_criacao), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
