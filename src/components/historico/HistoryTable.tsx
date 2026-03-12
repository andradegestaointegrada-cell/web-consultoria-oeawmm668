import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, Eye, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

export interface HistoricoDoc {
  id: string
  template_id: string
  upload_excel_id: string
  linha_numero: number
  arquivo_url: string | null
  data_geracao: string
  status: string
  templates?: { nome: string }
}

interface HistoryTableProps {
  data: HistoricoDoc[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onViewDetails: (doc: HistoricoDoc) => void
  onDelete: (id: string) => void
  onDownload: (url: string | null) => void
}

export function HistoryTable({
  data,
  loading,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
  onDelete,
  onDownload,
}: HistoryTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome do Documento</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Data de Geração</TableHead>
              <TableHead>Cliente / Linha</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum documento encontrado no histórico.
                </TableCell>
              </TableRow>
            ) : (
              data.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>
                        {doc.templates?.nome || 'Documento'} -{' '}
                        {format(new Date(doc.data_geracao), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.templates?.nome || 'Desconhecido'}</TableCell>
                  <TableCell>
                    {format(new Date(doc.data_geracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>Registro #{doc.linha_numero + 1}</TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.status === 'deletado' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {doc.status || 'Gerado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(doc.arquivo_url)}
                        disabled={!doc.arquivo_url}
                        title="Baixar"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(doc)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(doc.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 0) onPageChange(page - 1)
                }}
                className={cn(page === 0 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Página {page + 1} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages - 1) onPageChange(page + 1)
                }}
                className={cn(page >= totalPages - 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
