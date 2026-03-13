import { useState, useEffect, useMemo } from 'react'
import { Plus, FileSpreadsheet, FileText, Loader2, BookOpen, HandCoins } from 'lucide-react'
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
import { toast } from 'sonner'

export default function RelatorioDespesas() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [dbProjects, setDbProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [generatingDossier, setGeneratingDossier] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    const { data: projetosData } = await supabase.from('projeto_status' as any).select('*')
    const realProjects = projetosData || []
    setDbProjects(realProjects)

    let finalProjetos = [...realProjects]
    if (finalProjetos.length === 0) {
      finalProjetos = [
        {
          id: 'p1',
          cliente: 'Tech Solutions',
          projeto: 'Implementação de QMS',
          orcamento_previsto: 2000,
          usuario_id: user.id,
          isMock: true,
        },
        {
          id: 'p2',
          cliente: 'Global Systems',
          projeto: 'Auditoria Externa',
          orcamento_previsto: 500,
          usuario_id: user.id,
          isMock: true,
        },
        {
          id: 'p3',
          cliente: 'Alpha Industries',
          projeto: 'Treinamento de Equipe',
          orcamento_previsto: 1000,
          usuario_id: user.id,
          isMock: true,
        },
      ]
    }
    setProjects(finalProjetos)

    const { data: despesasData } = await supabase
      .from('despesas' as any)
      .select('*, usuarios(nome), projeto_status(projeto, cliente)')
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
          projeto_id: 'p1',
          comprovante_url: null,
          usuarios: { nome: 'Ana Paula' },
          projeto_status: { projeto: 'Implementação de QMS', cliente: 'Tech Solutions' },
          isMock: true,
        },
        {
          id: 'm2',
          data: '2023-10-12',
          categoria: 'hospedagem',
          valor: 450.0,
          descricao: 'Hotel SP',
          projeto_id: 'p2',
          comprovante_url: null,
          usuarios: { nome: 'Carlos Mendes' },
          projeto_status: { projeto: 'Auditoria Externa', cliente: 'Global Systems' },
          isMock: true,
        },
        {
          id: 'm3',
          data: '2023-10-13',
          categoria: 'alimentação',
          valor: 85.0,
          descricao: 'Almoço reuniões',
          projeto_id: 'p2',
          comprovante_url: null,
          usuarios: { nome: 'Lino e Consuelo' },
          projeto_status: { projeto: 'Auditoria Externa', cliente: 'Global Systems' },
          isMock: true,
        },
        {
          id: 'm4',
          data: '2023-11-02',
          categoria: 'material',
          valor: 320.0,
          descricao: 'Impressões e encadernação',
          projeto_id: 'p3',
          comprovante_url: null,
          usuarios: { nome: 'Ana Paula' },
          projeto_status: { projeto: 'Treinamento de Equipe', cliente: 'Alpha Industries' },
          isMock: true,
        },
      ]
    }
    setExpenses(finalData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const clients = Array.from(new Set(projects.map((p) => p.cliente).filter(Boolean)))

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      let match = true
      if (categoryFilter !== 'all' && e.categoria !== categoryFilter) match = false
      if (clientFilter !== 'all') {
        const cId = e.projeto_status?.cliente || e.cliente_id
        if (cId !== clientFilter) match = false
      }
      if (dateRange?.from) {
        const eDate = new Date(e.data)
        if (eDate < dateRange.from) match = false
        if (dateRange.to && eDate > dateRange.to) match = false
      }
      return match
    })
  }, [expenses, categoryFilter, clientFilter, dateRange])

  const handleExportCSV = () => {
    let csv = 'Relatorio de Despesas\nData,Categoria,Valor,Descricao,Projeto/Cliente\n'
    let total = 0
    filteredExpenses.forEach((d) => {
      const projStr = d.projeto_status
        ? `${d.projeto_status.projeto} (${d.projeto_status.cliente})`
        : d.cliente_id || ''
      csv += `${d.data},${d.categoria},${d.valor},"${d.descricao}","${projStr}"\n`
      total += Number(d.valor)
    })
    csv += `\nTotal,,,${total}\n`
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `despesas_${format(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }

  const handleGenerateDossier = async () => {
    setGeneratingDossier(true)
    const toastId = toast.loading('Gerando dossiê financeiro com IA, aguarde...')
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-dossier', {
        body: { expenses: filteredExpenses },
      })
      if (error) throw error
      if (data?.base64) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${data.base64}`
        link.download = `Dossie_Financeiro_${format(new Date(), 'yyyyMMdd')}.pdf`
        link.click()
        toast.success('Dossiê gerado com sucesso!', { id: toastId })
      }
    } catch (err: any) {
      toast.error('Erro ao gerar dossiê', { description: err.message, id: toastId })
    } finally {
      setGeneratingDossier(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <style>{`@media print { body { background-color: white !important; } .print-hidden { display: none !important; } [data-sidebar="sidebar"], header, nav { display: none !important; } main { padding: 0 !important; margin: 0 !important; } .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; } }`}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-primary" /> Relatório de Despesas
          </h1>
          <p className="text-muted-foreground mt-1 print-hidden">
            Gerencie custos operacionais, compare orçamentos e exporte dossiês.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print-hidden">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Excel
          </Button>
          <Button variant="default" onClick={handleGenerateDossier} disabled={generatingDossier}>
            {generatingDossier ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            Exportar Dossiê
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
                projects={dbProjects}
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

          <ExpenseCharts expenses={filteredExpenses} projects={projects} />

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
