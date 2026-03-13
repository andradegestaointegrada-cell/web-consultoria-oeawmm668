import { useState } from 'react'
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
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function ExpenseForm({
  onSuccess,
  projects,
  onCancel,
}: {
  onSuccess: () => void
  projects: any[]
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [data, setData] = useState<Date>()
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [projeto, setProjeto] = useState('none')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!data) {
      toast.error('Selecione a data da despesa')
      return
    }
    if (!categoria) {
      toast.error('Selecione uma categoria')
      return
    }
    const parsedValor = parseFloat(valor.replace(',', '.'))
    if (!valor || isNaN(parsedValor) || parsedValor <= 0) {
      toast.error('Informe um valor numérico válido maior que zero')
      return
    }
    if (!descricao || !descricao.trim()) {
      toast.error('Informe a descrição da despesa')
      return
    }

    if (!user) return
    setLoading(true)

    let comprovante_url = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      const { error: uploadError } = await supabase.storage.from('comprovantes').upload(path, file)
      if (uploadError) {
        toast.error('Erro ao fazer upload do comprovante', { description: uploadError.message })
        setLoading(false)
        return
      }
      comprovante_url = path
    }

    const selectedProject = projects.find((p) => p.id === projeto)
    const isMockProject = selectedProject?.isMock

    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const validProjetoId = projeto !== 'none' && !isMockProject && isUUID(projeto) ? projeto : null

    const { error } = await supabase.from('despesas' as any).insert({
      usuario_id: user.id,
      data: format(data, 'yyyy-MM-dd'),
      categoria,
      valor: parsedValor,
      descricao: descricao.trim(),
      projeto_id: validProjetoId,
      cliente_id: projeto !== 'none' ? selectedProject?.cliente : null,
      comprovante_url,
    })

    setLoading(false)
    if (error) {
      console.error('Erro no Supabase:', error)
      let friendlyMsg = 'Não foi possível registrar a despesa. Tente novamente.'
      if (error.message?.includes('uuid')) {
        friendlyMsg = 'O projeto selecionado não é válido.'
      }
      toast.error(friendlyMsg, { description: error.message })
    } else {
      toast.success('Despesa registrada com sucesso!')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col">
          <Label>Data *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !data && 'text-muted-foreground',
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data ? format(data, 'dd/MM/yyyy') : 'Selecione a data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data}
                onSelect={setData}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="hospedagem">Hospedagem</SelectItem>
              <SelectItem value="alimentação">Alimentação</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Valor (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label>Projeto Associado</Label>
          <Select value={projeto} onValueChange={setProjeto} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Opcional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.projeto} ({p.cliente})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição *</Label>
        <Textarea
          placeholder="Detalhes da despesa..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Anexar Comprovante (Opcional)</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={loading}
          className="cursor-pointer file:cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">Formatos suportados: PDF, JPG, PNG.</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  )
}
