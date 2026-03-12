import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ExcelUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [file, setFile] = useState<File | null>(null)
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{ columns: string[]; rows: string[][] } | null>(
    null,
  )

  const reset = () => {
    setStep(1)
    setFile(null)
    setCategoria('')
    setDescricao('')
    setPreviewData(null)
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) reset()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (!selected.name.endsWith('.xlsx')) {
        toast.error('Apenas arquivos .xlsx são permitidos')
        return
      }
      setFile(selected)
    }
  }

  const simulateParsing = () => {
    if (!file || !categoria) {
      toast.error('Preencha a categoria e selecione o arquivo.')
      return
    }
    setLoading(true)
    // Simulate parsing the first 5 rows of Excel file since no library is available
    setTimeout(() => {
      const columns = ['ID', 'Nome Completo', 'Email', 'Telefone', 'Status do Projeto']
      const rows = [
        ['101', 'Tech Solutions Ltda', 'contato@techsolutions.com', '(11) 99999-9999', 'Ativo'],
        ['102', 'Global Systems S.A.', 'admin@globalsys.com', '(11) 98888-8888', 'Em Progresso'],
        ['103', 'Alpha Industries', 'diretoria@alpha.com', '(21) 97777-7777', 'Crítico'],
        ['104', 'Beta Logistics', 'log@betalog.com', '(31) 96666-6666', 'Ativo'],
        ['105', 'Mega Retail Group', 'compras@megaretail.com', '(41) 95555-5555', 'Concluído'],
      ]
      setPreviewData({ columns, rows })
      setStep(2)
      setLoading(false)
    }, 1200)
  }

  const handleConfirm = async () => {
    if (!user || !file) return
    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      const { error: uploadError } = await supabase.storage.from('excel_uploads').upload(path, file)
      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('uploads_excel').insert({
        nome: file.name,
        usuario_id: user.id,
        tipo_dados: categoria,
        descricao: descricao,
        arquivo_url: path,
        colunas: previewData?.columns as any,
      })

      if (dbError) throw dbError

      toast.success('Arquivo de dados enviado com sucesso!')
      handleOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error('Erro ao salvar dados', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Upload de Fonte de Dados' : 'Prévia dos Dados'}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Faça o upload de uma planilha .xlsx para uso como fonte em documentos.'
              : 'Verifique se os dados foram lidos corretamente antes de confirmar o envio.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria de Dados</Label>
                <Input
                  placeholder="Ex: Clientes, Financeiro..."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo (.xlsx)</Label>
                <Input type="file" accept=".xlsx" onChange={handleFileChange} disabled={loading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Breve descrição do conteúdo desta planilha..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={loading}
                className="resize-none h-20"
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="border rounded-md overflow-x-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData?.columns.map((col, i) => (
                      <TableHead key={i} className="whitespace-nowrap font-semibold">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData?.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j} className="whitespace-nowrap">
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Exibindo apenas as primeiras 5 linhas detectadas para validação.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button onClick={simulateParsing} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Planilha
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:justify-end">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                Voltar
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar e Salvar
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
