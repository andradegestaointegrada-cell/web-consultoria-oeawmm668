import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, FileText, Loader2, FileDown, Edit, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function Documentos() {
  const { user } = useAuth()
  const [docType, setDocType] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [date, setDate] = useState<Date>()
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const [templates, setTemplates] = useState<{ id: string; tipo: string; nome: string }[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  const fetchRecentDocs = async () => {
    if (!user) return
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(5)

    if (data) setRecentDocs(data)
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true)
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('nome', { ascending: true })

      if (!error && data) {
        setTemplates(data)
      }
      setIsLoadingTemplates(false)
    }

    fetchTemplates()
    fetchRecentDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!docType || !clientName || !date || !description) {
      toast.error('Preencha todos os campos antes de gerar o documento.')
      return
    }

    if (!user) return

    setIsGenerating(true)

    const { error } = await supabase.from('documentos').insert({
      usuario_id: user.id,
      tipo_documento: docType,
      nome_cliente: clientName,
      status: 'rascunho',
    })

    setIsGenerating(false)

    if (error) {
      toast.error('Erro ao gerar documento.', { description: error.message })
      return
    }

    toast.success('Documento gerado com sucesso!', {
      description: `${docType} para ${clientName} foi processado.`,
    })

    setDocType('')
    setClientName('')
    setDate(undefined)
    setDescription('')

    fetchRecentDocs()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Fábrica de Documentos
          </h1>
          <p className="text-muted-foreground">
            Preencha o formulário para gerar um novo documento.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 bg-background">
          <Link to="/templates">
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            Gerenciar Templates
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Novo Documento</CardTitle>
            <CardDescription>Insira os dados do cliente e detalhes do projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select value={docType} onValueChange={setDocType} disabled={isLoadingTemplates}>
                    <SelectTrigger id="docType">
                      <SelectValue
                        placeholder={isLoadingTemplates ? 'Carregando...' : 'Selecione o tipo...'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.nome}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    placeholder="Ex: Tech Solutions Ltda"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        'w-full md:max-w-[240px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Breve</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente o propósito ou escopo deste documento..."
                  className="min-h-[120px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full md:w-auto h-11 px-8 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Gerar Documento'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gerados Recentemente</CardTitle>
            <CardDescription>Seus últimos documentos criados</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground">Arquivo</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      Nenhum documento recente.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-muted rounded-md text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span
                              className="text-sm truncate w-[140px] text-foreground"
                              title={`${doc.nome_cliente} - ${doc.tipo_documento}`}
                            >
                              {doc.nome_cliente} - {doc.tipo_documento}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {doc.data_criacao
                                ? format(new Date(doc.data_criacao), 'dd/MM/yyyy')
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link to={`/documentos/${doc.id}/editor`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
