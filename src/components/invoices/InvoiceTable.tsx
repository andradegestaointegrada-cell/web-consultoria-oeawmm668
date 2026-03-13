import { MoreHorizontal, FileText, FileDown, CheckCircle } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportInvoiceToWord, exportInvoiceToPDF } from '@/lib/invoice-export'

interface InvoiceTableProps {
  invoices: any[]
  onUpdateStatus: (id: string, status: string) => void
}

export function InvoiceTable({ invoices, onUpdateStatus }: InvoiceTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paga':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-none border-transparent">
            Paga
          </Badge>
        )
      case 'emitida':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 shadow-none border-transparent">
            Emitida
          </Badge>
        )
      case 'vencida':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 shadow-none border-transparent">
            Vencida
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-300">
            Rascunho
          </Badge>
        )
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">No. Fatura</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Emissão / Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                Nenhuma fatura encontrada.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const clientName = invoice.projeto_status?.cliente || 'Cliente não encontrado'
              const shortId = invoice.id.split('-')[0].toUpperCase()

              return (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium font-mono text-xs text-slate-500">
                    #{shortId}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                    {clientName}
                  </TableCell>
                  <TableCell className="capitalize">{invoice.servico}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm space-y-1">
                      <span>{format(new Date(invoice.data_emissao), 'dd/MM/yyyy')}</span>
                      <span className="text-muted-foreground text-xs">
                        Vence: {format(new Date(invoice.data_vencimento), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.valor)}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => exportInvoiceToWord(invoice, clientName)}>
                          <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                          Gerar Word
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportInvoiceToPDF(invoice, clientName)}>
                          <FileDown className="mr-2 h-4 w-4 text-rose-600" />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={invoice.status === 'paga'}
                          onClick={() => onUpdateStatus(invoice.id, 'paga')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                          Marcar como Paga
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
