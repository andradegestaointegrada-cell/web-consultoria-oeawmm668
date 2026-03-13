import { useState, useEffect, useMemo } from 'react'
import { Receipt, Plus, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { ExpenseForm } from '@/components/despesas/ExpenseForm'
import { ExpenseTable } from '@/components/despesas/ExpenseTable'
import { ExpenseCharts } from '@/components/despesas/ExpenseCharts'
import { BudgetDashboard } from '@/components/despesas/BudgetDashboard'
import { format } from 'date-fns'

export default function RelatorioDespesas() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    // Fetch despesas
    const { data: despesasData } = await supabase
      .from('despesas' as any)
      .select('*')
      .eq('usuario_id', user.id)
      .order('data', { ascending: false })

    let finalData = despesasData || []
    if (finalData.length === 0) {
      finalData = [
        {
          id: 'm1',
          data: '2023-10-05',
          categoria: 'transporte',
          valor: 150.5,
          descricao: 'Uber para cliente',
          cliente_id: 'Tech Solutions',
          comprovante_url: null,
        },
        {
          id: 'm2',
          data: '2023-10-12',
          categoria: 'hospedagem',
          valor: 450.0,
          descricao: 'Hotel SP',
          cliente_id: 'Global Systems',
          comprovante_url: null,
        },
        {
          id: 'm3',
          data: '2023-10-13',
          categoria: 'alimentação',
          valor: 85.0,
          descricao: 'Almoço reuniões',
          cliente_id: 'Global Systems',
          comprovante_url: null,
        },
        {
          id: 'm4',
          data: '2023-11-02',
          categoria: 'material',
          valor: 320.0,
          descricao: 'Impressões e encadernação',
          cliente_id: 'Alpha Industries',
          comprovante_url: null,
        },
      ]
    }
    setExpenses(finalData)

    // Fetch projetos for budget tracking
    const { data: projetosData } = await supabase
      .from('projeto_status' as any)
      .select('*')
      .eq('usuario_id', user.id)

    let finalProjetos = projetosData || []
    if (finalProjetos.length === 0) {
      finalProjetos = [
        { id: 'p1', cliente: 'Tech Solutions', orcamento_previsto: 2000, usuario_id: user.id },
        { id: 'p2', cliente: 'Global Systems', orcamento_previsto: 500, usuario_id: user.id },
        { id: 'p3', cliente: 'Alpha Industries', orcamento_previsto: 1000, usuario_id: user.id },
      ]
    }
    setProjects(finalProjetos)

    const { data: clientsData } = await supabase
      .from('documentos')
      .select('nome_cliente')
      .eq('usuario_id', user.id)

    const uniqueClients = Array.from(
      new Set([
        ...(clientsData?.map((c) => c.nome_cliente) || []),
        ...finalData.map((d) => d.cliente_id).filter(Boolean),
        ...finalProjetos.map((p) => p.cliente).filter(Boolean),
      ]),
    )
    setClients(uniqueClients as string[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      let match = true
      if (categoryFilter !== 'all' && e.categoria !== categoryFilter) match = false
      if (clientFilter !== 'all' && e.cliente_id !== clientFilter) match = false
      if (dateRange?.from) {
        const eDate = new Date(e.data)
        if (eDate < dateRange.from) match = false
        if (dateRange.to && eDate > dateRange.to) match = false
      }
      return match
    })
  }, [expenses, categoryFilter, clientFilter, dateRange])

  const handleExportCSV = () => {
    let csv = 'Relatorio de Despesas\n'
    csv += `Periodo: ${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Todos'} ate ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Todos'}\n`
    csv += `Categoria: ${categoryFilter}\nCliente: ${clientFilter}\n\n`
    csv += 'Data,Categoria,Valor,Descricao,Cliente\n'

    let total = 0
    filteredExpenses.forEach((d) => {
      csv += `${d.data},${d.categoria},${d.valor},"${d.descricao}",${d.cliente_id || ''}\n`
      total += Number(d.valor)
    })
    csv += `\nTotal,,,${total}\n`

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `despesas_${format(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <style>{`@media print { body { background-color: white !important; } .print-hidden { display: none !important; } [data-sidebar="sidebar"], header, nav { display: none !important; } main { padding: 0 !important; margin: 0 !important; } .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; } }`}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" /> Relatório de Despesas
          </h1>
          <p className="text-muted-foreground mt-1 print-hidden">
            Gerencie e analise os custos operacionais dos projetos.
          </p>
        </div>
        <div className="flex items-center gap-2 print-hidden">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Excel
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2 text-rose-600" /> PDF
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Despesa</DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onSuccess={() => {
                  setIsFormOpen(false)
                  fetchData()
                }}
                clients={clients}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <BudgetDashboard expenses={expenses} projects={projects} onUpdate={fetchData} />

          <Card className="shadow-sm print-hidden border-border mb-6">
            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-auto flex-1">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="hospedagem">Hospedagem</SelectItem>
                  <SelectItem value="alimentação">Alimentação</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <ExpenseCharts expenses={filteredExpenses} />

          <Card className="shadow-sm border-border mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Histórico de Despesas</CardTitle>
              <CardDescription className="print-hidden">
                Listagem detalhada dos custos registrados.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <ExpenseTable expenses={filteredExpenses} />
              <div className="mt-4 flex justify-end font-bold text-lg mr-4 pb-4 sm:pb-0">
                Total:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredExpenses.reduce((a, b) => a + Number(b.valor), 0),
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
