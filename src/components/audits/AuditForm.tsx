import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export function AuditForm({ onSuccess }: { onSuccess: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Auditoria cadastrada com sucesso!')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client">Cliente</Label>
          <Input id="client" placeholder="Nome do Cliente" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data da Auditoria</Label>
            <Input id="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status Inicial</Label>
            <Select defaultValue="progresso">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progresso">Em Progresso</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="auditor">Auditor Responsável</Label>
          <Select defaultValue="joao">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o auditor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joao">João Consultor</SelectItem>
              <SelectItem value="maria">Maria Silva</SelectItem>
              <SelectItem value="carlos">Carlos Mendes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" className="w-full sm:w-auto">
          Salvar Auditoria
        </Button>
      </div>
    </form>
  )
}
