import { useState, useEffect, useMemo } from 'react'
import { ReceiptText, Plus, Loader2 } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { InvoiceFilters } from '@/components/invoices/InvoiceFilters'
import { InvoiceTable } from '@/components/invoices/InvoiceTable'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default function Invoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Fetch clients/projects for the dropdowns
      const { data: projData, error: projError } = await supabase
        .from('projeto_status' as any)
        .select('id, cliente, projeto')
        .eq('usuario_id', user.id)

      if (projError) throw projError
      setProjects(projData || [])

      // Fetch Invoices
      const { data: invData, error: invError } = await supabase
        .from('invoices' as any)
        .select('*, projeto_status(cliente)')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })

      if (invError) throw invError
      setInvoices(invData || [])
    } catch (err: any) {
      toast.error('Erro ao buscar dados', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices' as any)
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
      toast.success('Status da fatura atualizado')
      setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv)))
    } catch (err: any) {
      toast.error('Erro ao atualizar status', { description: err.message })
    }
  }

  const clientsList = Array.from(
    new Map(projects.map((p) => [p.cliente, { id: p.id, name: p.cliente }])).values(),
  )

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      let match = true
      if (statusFilter !== 'all' && inv.status !== statusFilter) match = false
      if (clientFilter !== 'all' && inv.cliente_id !== clientFilter) match = false
      if (search) {
        const query = search.toLowerCase()
        if (
          !inv.centro_custo?.toLowerCase().includes(query) &&
          !inv.descricao?.toLowerCase().includes(query)
        ) {
          match = false
        }
      }
      if (dateRange?.from) {
        const eDate = new Date(inv.data_emissao)
        if (eDate < dateRange.from) match = false
        if (dateRange.to && eDate > dateRange.to) match = false
      }
      return match
    })
  }, [invoices, statusFilter, clientFilter, search, dateRange])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-[#6B46C1]" /> Gestão de Faturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie, acompanhe e exporte faturas de serviços para seus clientes.
          </p>
        </div>
        <Button
          className="bg-[#6B46C1] hover:bg-[#5b3da6] text-white"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Fatura
        </Button>
      </div>

      <InvoiceFilters
        clients={clientsList}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        search={search}
        setSearch={setSearch}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <Card className="shadow-sm border-border">
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B46C1]" />
            </div>
          ) : (
            <InvoiceTable invoices={filteredInvoices} onUpdateStatus={handleUpdateStatus} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Emitir Nova Fatura</DialogTitle>
            <DialogDescription>
              Preencha os dados do faturamento para gerar o documento.
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            projects={projects}
            onProjectCreated={(newProject) => setProjects((prev) => [...prev, newProject])}
            onSuccess={() => {
              setIsFormOpen(false)
              fetchData()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
