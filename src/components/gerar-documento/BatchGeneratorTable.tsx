import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Loader2, FileDown, Layers, Mail, CheckCircle2, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { processBatchGeneration, processSingleDocument } from '@/lib/generate-docs'
import { EmailDispatchDialog } from './EmailDispatchDialog'
import { BatchEmailDispatchDialog } from './BatchEmailDispatchDialog'
import { ScheduleEmailDialog } from './ScheduleEmailDialog'

interface BatchTableProps {
  rows: any[]
  columns: string[]
  template: any
  mappings: any[]
  uploadId: string
  userId: string
}

export function BatchGeneratorTable({
  rows,
  columns,
  template,
  mappings,
  uploadId,
  userId,
}: BatchTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [generatingRowId, setGeneratingRowId] = useState<number | null>(null)
  const [isBatching, setIsBatching] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  const [lastGeneratedItems, setLastGeneratedItems] = useState<{ id: string; row: any }[]>([])
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isBatchEmailModalOpen, setIsBatchEmailModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBatching) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isBatching])

  const toggleRow = (idx: number) => {
    setSelectedRows((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

  const toggleAll = () => {
    if (selectedRows.length === rows.length) setSelectedRows([])
    else setSelectedRows(rows.map((_, i) => i))
  }

  const handleSingleGenerate = async (row: any, idx: number) => {
    if (!template) return
    setGeneratingRowId(idx)
    setLastGeneratedItems([])

    try {
      const result = await processSingleDocument(row, idx, template, mappings, uploadId, userId)
      if (result?.documentId) {
        setLastGeneratedItems([{ id: result.documentId, row }])
      }
      toast.success('Documento gerado com sucesso!')
    } catch (error: any) {
      toast.error('Erro na geração', { description: error.message })
    } finally {
      setGeneratingRowId(null)
    }
  }

  const handleBatchGenerate = async () => {
    if (!template || selectedRows.length === 0) return
    setIsBatching(true)
    setLastGeneratedItems([])
    setBatchProgress({ current: 0, total: selectedRows.length })

    try {
      const { successCount, errorCount, generatedItems } = await processBatchGeneration({
        rows,
        selectedRows,
        template,
        mappings,
        uploadId,
        userId,
        onProgress: (c, t) => setBatchProgress({ current: c, total: t }),
      })

      if (successCount > 0) {
        toast.success('Lote gerado com sucesso!', {
          description: `${successCount} documentos gerados. ${errorCount > 0 ? `${errorCount} falhas.` : ''}`,
        })
        if (generatedItems?.length > 0) {
          setLastGeneratedItems(generatedItems)
        }
        setSelectedRows([])
      } else {
        toast.error('Nenhum documento gerado no lote.')
      }
    } catch (error: any) {
      toast.error('Erro no processamento em lote', { description: error.message })
    } finally {
      setIsBatching(false)
      setBatchProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="space-y-4">
      {lastGeneratedItems.length > 0 && !isBatching && generatingRowId === null && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-primary">Ação Concluída!</h4>
              <p className="text-sm text-primary/80">
                {lastGeneratedItems.length} documento(s) pronto(s). Deseja automatizar a entrega?
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            {lastGeneratedItems.length === 1 && (
              <Button
                variant="outline"
                onClick={() => setIsScheduleModalOpen(true)}
                className="gap-2 w-full sm:w-auto bg-background"
              >
                <CalendarClock className="h-4 w-4" />
                Agendar Envio
              </Button>
            )}
            <Button
              onClick={() => {
                if (lastGeneratedItems.length === 1) setIsEmailModalOpen(true)
                else setIsBatchEmailModalOpen(true)
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              {lastGeneratedItems.length === 1 ? 'Enviar Agora' : 'Enviar em Lote'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-muted/30 p-3 rounded-md gap-4">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Layers className="h-4 w-4" /> {selectedRows.length} registro(s) selecionado(s)
        </span>
        <Button
          onClick={handleBatchGenerate}
          disabled={
            !template || selectedRows.length === 0 || isBatching || generatingRowId !== null
          }
        >
          {isBatching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando lote...
            </>
          ) : (
            <>Gerar em Lote ({selectedRows.length})</>
          )}
        </Button>
      </div>

      {isBatching && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 p-4 border rounded-md bg-muted/20">
          <div className="flex justify-between text-sm font-medium text-foreground">
            <span>Processando documentos...</span>
            <span>
              {batchProgress.current} de {batchProgress.total} (
              {Math.round((batchProgress.current / batchProgress.total) * 100)}%)
            </span>
          </div>
          <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
        </div>
      )}

      <ScrollArea className="w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={selectedRows.length === rows.length && rows.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                  disabled={isBatching}
                />
              </TableHead>
              <TableHead className="w-[80px]">Linha</TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-right sticky right-0 bg-muted/50 w-[180px]">
                Ação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} data-state={selectedRows.includes(idx) ? 'selected' : undefined}>
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedRows.includes(idx)}
                    onCheckedChange={() => toggleRow(idx)}
                    aria-label={`Selecionar linha ${idx + 1}`}
                    disabled={isBatching}
                  />
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    className="max-w-[200px] truncate"
                    title={String(row[col] || '')}
                  >
                    {String(row[col] || '')}
                  </TableCell>
                ))}
                <TableCell className="text-right sticky right-0 bg-background/95 backdrop-blur">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!template || isBatching || generatingRowId !== null}
                    onClick={() => handleSingleGenerate(row, idx)}
                    className="w-full sm:w-auto"
                  >
                    {generatingRowId === idx ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" /> Gerar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <EmailDispatchDialog
        isOpen={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        documentIds={lastGeneratedItems.map((i) => i.id)}
        rowData={lastGeneratedItems[0]?.row}
        onSuccess={() => setLastGeneratedItems([])}
      />

      <BatchEmailDispatchDialog
        isOpen={isBatchEmailModalOpen}
        onOpenChange={setIsBatchEmailModalOpen}
        batchItems={lastGeneratedItems}
        onSuccess={() => setLastGeneratedItems([])}
      />

      <ScheduleEmailDialog
        isOpen={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        documentId={lastGeneratedItems.length === 1 ? lastGeneratedItems[0].id : ''}
        rowData={lastGeneratedItems[0]?.row}
        onSuccess={() => setLastGeneratedItems([])}
      />
    </div>
  )
}
