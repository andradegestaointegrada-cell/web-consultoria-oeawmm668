import { useState, useEffect } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface MappingFormProps {
  template: any
  uploadId: string
  columns: string[]
  onSaved: () => void
  onCancel: () => void
}

export function ExcelMappingForm({
  template,
  uploadId,
  columns,
  onSaved,
  onCancel,
}: MappingFormProps) {
  const { user } = useAuth()
  const [placeholders, setPlaceholders] = useState<any[]>([])
  const [config, setConfig] = useState<Record<string, { column: string; type: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadPlaceholders = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.functions.invoke('parse-word-placeholders', {
          body: { path: template.arquivo_docx_url },
        })
        if (error) throw error
        const fetchedPlaceholders = data.placeholders || []
        setPlaceholders(fetchedPlaceholders)

        const initial: Record<string, { column: string; type: string }> = {}
        fetchedPlaceholders.forEach((p: any) => {
          initial[p.nome_placeholder] = { column: '', type: 'Texto' }
        })
        setConfig(initial)
      } catch (err: any) {
        toast.error('Erro ao ler template', { description: err.message })
      } finally {
        setIsLoading(false)
      }
    }
    if (template?.arquivo_docx_url) loadPlaceholders()
  }, [template])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const mappingArray = Object.entries(config).map(([ph, val]) => ({
        placeholder: ph,
        column: val.column,
        type: val.type,
      }))

      // Validação via Edge Function
      const { data: valData, error: valErr } = await supabase.functions.invoke(
        'validate-excel-mapping',
        {
          body: { mapping: mappingArray },
        },
      )

      if (valErr || !valData?.valid) {
        throw new Error(valData?.error || valErr?.message || 'A validação do mapeamento falhou.')
      }

      // Remove mapeamento antigo se existir (clean up)
      await supabase
        .from('mapeamento_excel' as any)
        .delete()
        .eq('template_id', template.id)
        .eq('upload_excel_id', uploadId)
        .eq('usuario_id', user?.id)

      // Insere novo mapeamento
      const { error: insErr } = await supabase.from('mapeamento_excel' as any).insert({
        template_id: template.id,
        upload_excel_id: uploadId,
        usuario_id: user?.id,
        mapeamento_json: mappingArray,
      })

      if (insErr) throw insErr

      toast.success('Mapeamento salvo e validado com sucesso!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao salvar mapeamento', { description: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 bg-card rounded-lg border p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Configurar Mapeamento</h3>
        <p className="text-sm text-muted-foreground">
          Associe as variáveis do documento às colunas da sua planilha.
        </p>
      </div>

      <Alert className="bg-primary/5 text-primary border-primary/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Todas as variáveis devem ser associadas a uma coluna válida para garantir a geração
          correta dos documentos em lote.
        </AlertDescription>
      </Alert>

      <div className="border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/3">Variável (Documento)</TableHead>
              <TableHead className="w-1/3">Coluna Correspondente (Excel)</TableHead>
              <TableHead className="w-1/3">Tipo de Dado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholders.map((p) => (
              <TableRow key={p.nome_placeholder}>
                <TableCell className="font-mono text-sm tracking-tight text-primary">
                  {`{{${p.nome_placeholder}}}`}
                </TableCell>
                <TableCell>
                  <Select
                    value={config[p.nome_placeholder]?.column}
                    onValueChange={(v) =>
                      setConfig((prev) => ({
                        ...prev,
                        [p.nome_placeholder]: { ...prev[p.nome_placeholder], column: v },
                      }))
                    }
                  >
                    <SelectTrigger
                      className={
                        !config[p.nome_placeholder]?.column
                          ? 'border-amber-400 focus:ring-amber-400'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Selecione uma coluna..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c: string) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={config[p.nome_placeholder]?.type}
                    onValueChange={(v) =>
                      setConfig((prev) => ({
                        ...prev,
                        [p.nome_placeholder]: { ...prev[p.nome_placeholder], type: v },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Texto">Texto</SelectItem>
                      <SelectItem value="Número">Número</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {placeholders.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhuma variável detectada no documento selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving || placeholders.length === 0}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar e Continuar
        </Button>
      </div>
    </div>
  )
}
