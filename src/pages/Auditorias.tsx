import { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuditForm } from '@/components/audits/AuditForm'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Auditorias() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')

  const fetchAudits = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('auditorias' as any)
      .select(`*, projeto_status(cliente), auditor:usuarios!auditor_id(nome)`)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao buscar auditorias')
    } else if (data && data.length > 0) {
      setAudits(data)
    } else {
      setAudits([
        {
          id: 'mock-1',
          norma: 'ISO 9001',
          data_auditoria: new Date().toISOString(),
          status: 'planejada',
          projeto_status: { cliente: 'Tech Solutions' },
          auditor: { nome: 'João Consultor' },
        },
        {
          id: 'mock-2',
          norma: 'ISO 14001',
          data_auditoria: '2023-10-15',
          status: 'em_andamento',
          projeto_status: { cliente: 'Global Systems' },
          auditor: { nome: 'Maria Silva' },
        },
      ])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAudits()
  }, [user])

  const handleDelete = async (id: string) => {
    if (id.startsWith('mock-')) return setAudits(audits.filter((a) => a.id !== id))
    if (!confirm('Excluir auditoria permanentemente?')) return
    const { error } = await supabase
      .from('auditorias' as any)
      .delete()
      .eq('id', id)
    if (error) toast.error('Erro ao excluir', { description: error.message })
    else {
      toast.success('Auditoria excluída')
      fetchAudits()
    }
  }

  const filtered = audits.filter((a) =>
    a.projeto_status?.cliente?.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'concluida':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shadow-none">
            Concluída
          </Badge>
        )
      case 'em_andamento':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none shadow-none">
            Em Andamento
          </Badge>
        )
      case 'planejada':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none shadow-none">
            Planejada
          </Badge>
        )
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" /> Auditorias
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e gerencie auditorias em andamento.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Auditoria
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <div className="p-4 border-b flex items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cliente</TableHead>
              <TableHead>Norma</TableHead>
              <TableHead>Data da Auditoria</TableHead>
              <TableHead>Auditor Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhuma auditoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                    {a.projeto_status?.cliente || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal bg-background">
                      {a.norma}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(a.data_auditoria), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{a.auditor?.nome || '-'}</TableCell>
                  <TableCell>{getStatusBadge(a.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Auditoria</DialogTitle>
            <DialogDescription>
              Preencha os dados técnicos e administrativos da auditoria.
            </DialogDescription>
          </DialogHeader>
          <AuditForm
            onSuccess={() => {
              setIsDialogOpen(false)
              fetchAudits()
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
