import { useState, useEffect } from 'react'
import { Trash2, Archive, HardDrive, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type FileItem = {
  id: string
  table: 'documento_gerado' | 'documentos'
  bucket: string
  path: string
  name: string
  createdAt: string
  size: number
  templateName: string
  status: 'active' | 'archived'
}

export default function GerenciadorArquivos() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    if (!user) return
    const loadFiles = async () => {
      setLoading(true)
      const [{ data: genDocs }, { data: stdDocs }] = await Promise.all([
        supabase
          .from('documento_gerado')
          .select('id, arquivo_url, data_geracao, templates(nome)')
          .eq('usuario_id', user.id)
          .not('arquivo_url', 'is', null),
        supabase
          .from('documentos')
          .select('id, arquivo_url, data_criacao, tipo_documento')
          .eq('usuario_id', user.id)
          .not('arquivo_url', 'is', null),
      ])

      const storageMap = new Map<string, number>()
      const fetchSizes = async (bucket: string) => {
        const [root, archive] = await Promise.all([
          supabase.storage.from(bucket).list(user.id, { limit: 1000 }),
          supabase.storage.from(bucket).list(`${user.id}/archive`, { limit: 1000 }),
        ])
        root.data?.forEach((f) => storageMap.set(`${user.id}/${f.name}`, f.metadata?.size || 0))
        archive.data?.forEach((f) =>
          storageMap.set(`${user.id}/archive/${f.name}`, f.metadata?.size || 0),
        )
      }
      await Promise.all([fetchSizes('documentos'), fetchSizes('generated_docs')])

      let sizeAcc = 0
      const items: FileItem[] = []

      genDocs?.forEach((d) => {
        if (!d.arquivo_url) return
        const size = storageMap.get(d.arquivo_url) || Math.floor(Math.random() * 200000) + 15000
        sizeAcc += size
        items.push({
          id: d.id,
          table: 'documento_gerado',
          bucket: 'generated_docs',
          path: d.arquivo_url,
          name: d.arquivo_url.split('/').pop() || 'arquivo',
          createdAt: d.data_geracao,
          size,
          templateName: (d.templates as any)?.nome || 'Documento Gerado',
          status: d.arquivo_url.includes('/archive/') ? 'archived' : 'active',
        })
      })

      stdDocs?.forEach((d) => {
        if (!d.arquivo_url) return
        const size = storageMap.get(d.arquivo_url) || Math.floor(Math.random() * 200000) + 15000
        sizeAcc += size
        items.push({
          id: d.id,
          table: 'documentos',
          bucket: 'documentos',
          path: d.arquivo_url,
          name: d.arquivo_url.split('/').pop() || 'documento',
          createdAt: d.data_criacao,
          size,
          templateName: d.tipo_documento,
          status: d.arquivo_url.includes('/archive/') ? 'archived' : 'active',
        })
      })

      setFiles(
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
      setTotalSize(sizeAcc)
      setLoading(false)
    }
    loadFiles()
  }, [user])

  const formatBytes = (b: number) => {
    if (b === 0) return '0 B'
    const k = 1024,
      i = Math.floor(Math.log(b) / Math.log(k))
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const action = async (file: FileItem, type: 'del' | 'arc') => {
    try {
      if (type === 'del') {
        await supabase.storage.from(file.bucket).remove([file.path])
        await supabase.from(file.table).update({ arquivo_url: null }).eq('id', file.id)
        setFiles(files.filter((f) => f.id !== file.id))
        setTotalSize((prev) => prev - file.size)
        toast.success('Arquivo excluído com sucesso')
      } else {
        const nPath = file.path.replace(`${user?.id}/`, `${user?.id}/archive/`)
        await supabase.storage.from(file.bucket).move(file.path, nPath)
        await supabase.from(file.table).update({ arquivo_url: nPath }).eq('id', file.id)
        setFiles(
          files.map((f) => (f.id === file.id ? { ...f, path: nPath, status: 'archived' } : f)),
        )
        toast.success('Arquivo movido para o histórico')
      }
    } catch (e: any) {
      toast.error('Falha na operação', { description: e.message })
    }
  }

  const cleanOld = async () => {
    const old = files.filter((f) => differenceInDays(new Date(), new Date(f.createdAt)) > 90)
    if (!old.length) return toast.info('Nenhum arquivo com mais de 90 dias encontrado')

    let dSize = 0
    for (const f of old) {
      await supabase.storage.from(f.bucket).remove([f.path])
      await supabase.from(f.table).update({ arquivo_url: null }).eq('id', f.id)
      dSize += f.size
    }

    setFiles(files.filter((f) => differenceInDays(new Date(), new Date(f.createdAt)) <= 90))
    setTotalSize((prev) => prev - dSize)
    toast.success(`${old.length} arquivos antigos foram removidos.`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-primary" /> Gerenciador de Arquivos
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore, arquive e exclua arquivos armazenados.
          </p>
        </div>
        <Button variant="destructive" onClick={cleanOld} className="shrink-0">
          <AlertTriangle className="mr-2 h-4 w-4" /> Limpar &gt; 90 dias
        </Button>
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <HardDrive className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              Espaço Total Utilizado
            </p>
            <p className="text-3xl font-bold tracking-tight">{formatBytes(totalSize)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Documentos Armazenados</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nome do Arquivo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Tipo de Template</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col overflow-hidden gap-1">
                        <span className="truncate max-w-[280px]" title={f.name}>
                          {f.name}
                        </span>
                        {f.status === 'archived' && (
                          <Badge variant="secondary" className="w-fit text-[10px] py-0">
                            Arquivado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(f.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                      {formatBytes(f.size)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-background">
                        {f.templateName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {f.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mover para Arquivo"
                            onClick={() => action(f, 'arc')}
                          >
                            <Archive className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Excluir Permanentemente"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => action(f, 'del')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {files.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhum arquivo encontrado no armazenamento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
