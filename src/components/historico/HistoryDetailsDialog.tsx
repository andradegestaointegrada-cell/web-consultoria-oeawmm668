import { useEffect, useState } from 'react'
import { Loader2, Database, LayoutTemplate } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { HistoricoDoc } from './HistoryTable'

interface HistoryDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: HistoricoDoc | null
  userId: string
}

export function HistoryDetailsDialog({
  open,
  onOpenChange,
  doc,
  userId,
}: HistoryDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [mappings, setMappings] = useState<any[]>([])
  const [rowData, setRowData] = useState<any>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !doc || !userId) return
      setLoading(true)

      try {
        const { data: mappingsData } = await supabase
          .from('mapeamento_placeholders')
          .select('*')
          .eq('template_id', doc.template_id)
          .eq('upload_excel_id', doc.upload_excel_id)
          .eq('usuario_id', userId)

        setMappings(mappingsData || [])

        const { data: uploadData } = await supabase
          .from('uploads_excel')
          .select('arquivo_url')
          .eq('id', doc.upload_excel_id)
          .single()

        if (uploadData?.arquivo_url) {
          const { data: excelRes } = await supabase.functions.invoke('read-excel-rows', {
            body: { path: uploadData.arquivo_url },
          })
          if (excelRes?.rows && excelRes.rows.length > doc.linha_numero) {
            setRowData(excelRes.rows[doc.linha_numero])
          } else {
            setRowData(null)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [open, doc, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Geração</DialogTitle>
          <DialogDescription>
            Metadados e valores utilizados para gerar o documento.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Mapeamento (Template &rarr; Coluna)
              </h3>
              <div className="bg-muted/50 p-3 rounded-md border max-h-[300px] overflow-y-auto text-sm">
                {mappings.length > 0 ? (
                  <ul className="space-y-2">
                    {mappings.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-col border-b pb-1 last:border-0 last:pb-0"
                      >
                        <span className="font-mono text-xs text-muted-foreground">{`{{${m.placeholder_nome}}}`}</span>
                        <span className="font-medium truncate">{m.coluna_excel_mapeada}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhum mapeamento salvo encontrado.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Dados Extraídos (Linha #{doc ? doc.linha_numero + 1 : ''})
              </h3>
              <div className="bg-muted/50 p-3 rounded-md border max-h-[300px] overflow-y-auto text-sm">
                {rowData && Object.keys(rowData).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(rowData).map(([key, val]) => (
                      <li key={key} className="flex flex-col border-b pb-1 last:border-0 last:pb-0">
                        <span className="text-xs text-muted-foreground">{key}</span>
                        <span className="font-medium truncate" title={String(val)}>
                          {String(val)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    Não foi possível recuperar os dados brutos.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
