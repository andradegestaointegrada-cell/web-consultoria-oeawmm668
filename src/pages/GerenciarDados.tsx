import { useState, useEffect } from 'react'
import { Database, Search, Trash2, Eye, FileSpreadsheet } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExcelUploadDialog } from '@/components/data/ExcelUploadDialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function GerenciarDados() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<any>(null)

  const fetchUploads = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('uploads_excel')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_upload', { ascending: false })

    if (error) {
      toast.error('Erro ao buscar dados', { description: error.message })
    } else {
      setUploads(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUploads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDelete = async (upload: any) => {
    if (!confirm(`Deseja excluir o arquivo "${upload.nome}" permanentemente?`)) return

    try {
      if (upload.arquivo_url) {
        await supabase.storage.from('excel_uploads').remove([upload.arquivo_url])
      }

      const { error } = await supabase.from('uploads_excel').delete().eq('id', upload.id)
      if (error) throw error

      toast.success('Fonte de dados excluída com sucesso')
      fetchUploads()
    } catch (err: any) {
      toast.error('Erro ao excluir', { description: err.message })
    }
  }

  const handlePreview = (upload: any) => {
    setSelectedUpload(upload)
    setPreviewOpen(true)
  }

  const filteredUploads = uploads.filter((u) => {
    const matchesSearch = u.nome.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'todas' || u.tipo_dados === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(uploads.map((u) => u.tipo_dados).filter(Boolean)))

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Gerenciamento de Dados
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize e importe planilhas para consumo dinâmico nos documentos.
          </p>
        </div>
        <ExcelUploadDialog onSuccess={fetchUploads} />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{uploads.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-3">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4 h-full items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[220px] shrink-0">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Arquivo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Colunas Identificadas</TableHead>
              <TableHead>Data de Envio</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Carregando informações...
                </TableCell>
              </TableRow>
            ) : filteredUploads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <FileSpreadsheet className="h-10 w-10 mb-3 opacity-20" />
                    <p>Nenhuma fonte de dados encontrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUploads.map((upload) => (
                <TableRow key={upload.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[280px]" title={upload.nome}>
                        {upload.nome}
                      </span>
                      {upload.descricao && (
                        <span className="text-xs text-muted-foreground truncate max-w-[280px] font-normal mt-0.5">
                          {upload.descricao}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {upload.tipo_dados ? (
                      <Badge variant="secondary" className="bg-muted font-normal">
                        {upload.tipo_dados}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {upload.colunas && Array.isArray(upload.colunas) ? upload.colunas.length : 0}{' '}
                      campos
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {upload.data_upload
                      ? format(new Date(upload.data_upload), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handlePreview(upload)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 hover:text-destructive text-destructive"
                        onClick={() => handleDelete(upload)}
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
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Fonte de Dados</DialogTitle>
            <DialogDescription>{selectedUpload?.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <h4 className="text-sm font-semibold mb-3">Colunas Mapeadas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUpload?.colunas && Array.isArray(selectedUpload.colunas) ? (
                  selectedUpload.colunas.map((col: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-muted/50 font-normal">
                      {col}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Nenhuma coluna processada ou salva.
                  </span>
                )}
              </div>
            </div>
            {selectedUpload?.descricao && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Descrição Fornecida</h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
                  {selectedUpload.descricao}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
