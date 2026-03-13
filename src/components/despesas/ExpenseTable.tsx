import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Paperclip } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function ExpenseTable({ expenses }: { expenses: any[] }) {
  return (
    <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center w-[100px]">Anexo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma despesa encontrada para os filtros selecionados.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((e) => (
              <TableRow key={e.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {format(new Date(e.data), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize font-normal">
                    {e.categoria}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate" title={e.descricao}>
                  {e.descricao}
                </TableCell>
                <TableCell className="text-muted-foreground">{e.cliente_id || '-'}</TableCell>
                <TableCell className="text-center">
                  {e.comprovante_url ? (
                    <a
                      href={
                        supabase.storage.from('comprovantes').getPublicUrl(e.comprovante_url).data
                          .publicUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center p-1.5 text-primary hover:bg-muted rounded-md transition-colors"
                      title="Ver Comprovante"
                    >
                      <Paperclip className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    e.valor,
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
