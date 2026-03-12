import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, PlusCircle, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const recentDocuments = [
  { id: 1, name: 'Projeto Residencial Silva', date: '25/10/2023', type: 'Proposta' },
  { id: 2, name: 'Auditoria Interna Q3', date: '22/10/2023', type: 'Relatório' },
  { id: 3, name: 'Manual de Integração de TI', date: '20/10/2023', type: 'Manual' },
  { id: 4, name: 'Proposta Comercial - TechCorp', date: '18/10/2023', type: 'Proposta' },
  { id: 5, name: 'Relatório de Conformidade ISO', date: '15/10/2023', type: 'Relatório' },
]

export default function Index() {
  const { user } = useAuth()
  const today = format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Aqui está o resumo do seu desempenho e atividades.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {today}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Documentos este mês
            </CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">24</div>
            <p className="text-sm text-emerald-600 mt-2 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
              +4 em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 md:col-span-2 flex items-center bg-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <CardContent className="flex flex-col sm:flex-row items-center justify-between w-full p-6 sm:p-8 gap-6 relative z-10">
            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900">Pronto para começar?</h3>
              <p className="text-slate-500 text-sm max-w-sm">
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

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Atividade Recente</CardTitle>
          <p className="text-sm text-slate-500">Seus últimos documentos criados no sistema.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-600">Nome do Documento</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[150px]">Tipo</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right w-[150px]">
                  Data de Criação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-md text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    {doc.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        doc.type === 'Proposta'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
                          : doc.type === 'Relatório'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200'
                      }
                    >
                      {doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 font-medium">
                    {doc.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
