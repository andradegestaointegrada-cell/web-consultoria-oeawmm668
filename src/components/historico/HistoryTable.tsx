import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, Eye, Trash2, FileText, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  status_envio?: string
  tentativas_envio?: number
  ultima_tentativa?: string
  templates?: { nome: string }
}

interface HistoryTableProps {
  data: HistoricoDoc[]
  loading: boolean
  page: number
  totalPages: number
  retryingId: string | null
  onPageChange: (page: number) => void
  onViewDetails: (doc: HistoricoDoc) => void
  onDelete: (id: string) => void
  onDownload: (url: string | null) => void
  onRetry: (doc: HistoricoDoc) => void
}

export function HistoryTable({
  data,
  loading,
  page,
  totalPages,
  retryingId,
  onPageChange,
  onViewDetails,
  onDelete,
  onDownload,
  onRetry,
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
              <TableHead>Status Doc.</TableHead>
              <TableHead>Status Envio</TableHead>
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
                  <TableCell>
                    <Badge
                      variant={doc.status === 'deletado' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {doc.status || 'Gerado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge
                        variant={
                          doc.status_envio === 'erro'
                            ? 'destructive'
                            : doc.status_envio === 'enviado'
                              ? 'default'
                              : 'secondary'
                        }
                        className="capitalize"
                      >
                        {doc.status_envio || 'N/A'}
                      </Badge>
                      {(doc.tentativas_envio ?? 0) > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {doc.tentativas_envio} tentativas
                          {doc.ultima_tentativa && (
                            <> - {format(new Date(doc.ultima_tentativa), 'HH:mm')}</>
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {doc.status_envio === 'erro' && (doc.tentativas_envio ?? 0) < 3 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRetry(doc)}
                              disabled={retryingId === doc.id}
                            >
                              <RefreshCw
                                className={cn(
                                  'h-4 w-4 text-orange-500',
                                  retryingId === doc.id && 'animate-spin',
                                )}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reenviar Documento</TooltipContent>
                        </Tooltip>
                      )}
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
