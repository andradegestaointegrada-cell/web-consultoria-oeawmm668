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
import { Users, Trophy } from 'lucide-react'

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
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Volume de Documentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum cliente registrado no momento.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {i === 0 ? <Trophy className="h-4 w-4 text-amber-500 mx-auto" /> : i + 1}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{c.client}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="font-mono bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      >
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
