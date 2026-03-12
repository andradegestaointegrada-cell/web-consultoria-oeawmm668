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
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
