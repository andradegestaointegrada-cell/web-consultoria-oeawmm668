import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, FileText, Loader2, FileDown, Edit } from 'lucide-react'
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

const recentDocs = [
  { id: 'DOC-102', name: 'Auditoria_TechCorp.pdf', date: '12/10/2023', author: 'João Silva' },
  { id: 'DOC-101', name: 'Contrato_GlobalSys.pdf', date: '10/10/2023', author: 'Ana Souza' },
  { id: 'DOC-100', name: 'PlanoAcao_Marketing.pdf', date: '08/10/2023', author: 'Carlos Mendes' },
]

export default function Documentos() {
  const [docType, setDocType] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [date, setDate] = useState<Date>()
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!docType || !clientName || !date || !description) {
      toast.error('Preencha todos os campos antes de gerar o documento.')
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Documento gerado com sucesso!', {
        description: `${docType} para ${clientName} foi processado.`,
      })

      setDocType('')
      setClientName('')
      setDate(undefined)
      setDescription('')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fábrica de Documentos</h1>
        <p className="text-muted-foreground">Preencha o formulário para gerar um novo documento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Novo Documento</CardTitle>
            <CardDescription>Insira os dados do cliente e detalhes do projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger id="docType">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proposta Comercial">Proposta Comercial</SelectItem>
                      <SelectItem value="Relatório de Auditoria">Relatório de Auditoria</SelectItem>
                      <SelectItem value="Manual de Procedimentos">
                        Manual de Procedimentos
                      </SelectItem>
                      <SelectItem value="Instrução de Trabalho">Instrução de Trabalho</SelectItem>
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

        <Card className="shadow-sm border-slate-200 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gerados Recentemente</CardTitle>
            <CardDescription>Seus últimos documentos criados</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-semibold text-slate-600">Arquivo</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-slate-100">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-md text-slate-500">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm truncate w-[140px] text-slate-900">
                            {doc.name}
                          </span>
                          <span className="text-xs text-slate-500">{doc.date}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
