import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Eye } from 'lucide-react'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuditForm } from '@/components/audits/AuditForm'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type StatusType = 'Concluído' | 'Em Progresso' | 'Crítico'

const auditsData = [
  {
    id: 'AUD-2023-01',
    client: 'Tech Solutions',
    date: '15/10/2023',
    auditor: 'João Consultor',
    status: 'Concluído' as StatusType,
  },
  {
    id: 'AUD-2023-02',
    client: 'Global Systems',
    date: '18/10/2023',
    auditor: 'Maria Silva',
    status: 'Em Progresso' as StatusType,
  },
  {
    id: 'AUD-2023-03',
    client: 'Alpha Industries',
    date: '20/10/2023',
    auditor: 'Carlos Mendes',
    status: 'Crítico' as StatusType,
  },
  {
    id: 'AUD-2023-04',
    client: 'Beta Logistics',
    date: '22/10/2023',
    auditor: 'João Consultor',
    status: 'Em Progresso' as StatusType,
  },
  {
    id: 'AUD-2023-05',
    client: 'Mega Retail',
    date: '25/10/2023',
    auditor: 'Ana Paula',
    status: 'Concluído' as StatusType,
  },
]

export default function Auditorias() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const getStatusBadge = (status: StatusType) => {
    switch (status) {
      case 'Concluído':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent shadow-none">
            Concluído
          </Badge>
        )
      case 'Em Progresso':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-transparent shadow-none">
            Em Progresso
          </Badge>
        )
      case 'Crítico':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent shadow-none">
            Crítico
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditorias</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todas as auditorias em andamento.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Auditoria
        </Button>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou ID..." className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditsData.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium text-muted-foreground">{audit.id}</TableCell>
                <TableCell className="font-semibold text-slate-900">{audit.client}</TableCell>
                <TableCell>{audit.date}</TableCell>
                <TableCell>{audit.auditor}</TableCell>
                <TableCell>{getStatusBadge(audit.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver Detalhes</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-4 border-t flex items-center justify-end">
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Cadastrar Nova Auditoria</SheetTitle>
            <SheetDescription>
              Preencha as informações iniciais para registrar uma nova auditoria no sistema.
            </SheetDescription>
          </SheetHeader>
          <AuditForm onSuccess={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
