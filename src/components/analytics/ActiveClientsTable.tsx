import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

export function ActiveClientsTable({ clients }: { clients: any[] }) {
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Clientes Mais Ativos
        </CardTitle>
        <CardDescription>
          Ranking dos top clientes por volume total de documentos solicitados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="rounded-md border h-[300px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Volume de Documentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Nenhum cliente registrado no momento.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.client}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {c.count} docs
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
