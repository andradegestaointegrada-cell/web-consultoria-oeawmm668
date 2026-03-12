import { useState } from 'react'
import { FileText, Search, FileDown, Edit, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentForm } from '@/components/documents/DocumentForm'

const templates = [
  {
    id: 1,
    title: 'Relatório de Auditoria',
    desc: 'Modelo padrão para relatórios finais',
    category: 'Auditoria',
  },
  {
    id: 2,
    title: 'Contrato de Prestação',
    desc: 'Contrato padrão de serviços B2B',
    category: 'Jurídico',
  },
  {
    id: 3,
    title: 'Plano de Ação',
    desc: 'Planejamento de correções e melhorias',
    category: 'Gestão',
  },
  {
    id: 4,
    title: 'Termo de Confidencialidade',
    desc: 'NDA padrão para novos projetos',
    category: 'Jurídico',
  },
]

const recentDocs = [
  { id: 'DOC-102', name: 'Auditoria_TechCorp.pdf', date: '12/10/2023', author: 'João Silva' },
  { id: 'DOC-101', name: 'Contrato_GlobalSys.pdf', date: '10/10/2023', author: 'Ana Souza' },
  { id: 'DOC-100', name: 'PlanoAcao_Marketing.pdf', date: '08/10/2023', author: 'Carlos Mendes' },
]

export default function Documentos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleGenerate = (title: string) => {
    setSelectedTemplate(title)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fábrica de Documentos</h1>
          <p className="text-muted-foreground">Gere contratos, relatórios e planos rapidamente.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar templates..." className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select defaultValue="todos">
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              <SelectItem value="auditoria">Auditoria</SelectItem>
              <SelectItem value="juridico">Jurídico</SelectItem>
              <SelectItem value="gestao">Gestão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            className="group hover:border-primary/50 transition-colors shadow-sm flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {tpl.category}
                </span>
              </div>
              <CardTitle className="text-base">{tpl.title}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{tpl.desc}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                onClick={() => handleGenerate(tpl.title)}
              >
                Gerar Agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Documentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Data de Geração</TableHead>
                <TableHead>Gerado por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {doc.name}
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download">
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gerar {selectedTemplate}</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para gerar o documento automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DocumentForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
