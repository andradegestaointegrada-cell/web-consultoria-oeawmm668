import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuditFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AuditForm({ onSuccess, onCancel }: AuditFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [auditors, setAuditors] = useState<any[]>([])

  const [clienteId, setClienteId] = useState('')
  const [norma, setNorma] = useState('')
  const [dataAuditoria, setDataAuditoria] = useState('')
  const [auditorId, setAuditorId] = useState('')
  const [escopo, setEscopo] = useState('')

  useEffect(() => {
    const fetchOptions = async () => {
      if (!user) return

      const [projRes, usersRes] = await Promise.all([
        supabase.from('projeto_status').select('id, cliente').eq('usuario_id', user.id),
        supabase.from('usuarios').select('id, nome, role'),
      ])

      if (projRes.data && projRes.data.length > 0) {
        setClients(projRes.data)
      } else {
        setClients([{ id: 'mock-proj-1', cliente: 'Cliente Exemplo Ltda' }])
      }

      if (usersRes.data && usersRes.data.length > 0) {
        const consultores = usersRes.data.filter((u: any) => u.role === 'consultor')
        setAuditors(consultores.length > 0 ? consultores : usersRes.data)
      } else {
        setAuditors([{ id: 'mock-user-1', nome: 'Consultor Exemplo' }])
      }
    }
    fetchOptions()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId || !norma || !dataAuditoria || !auditorId) {
      return toast.error('Preencha todos os campos obrigatórios')
    }

    if (clienteId.startsWith('mock-')) {
      toast.success('Auditoria cadastrada (Modo de Demonstração)')
      return onSuccess()
    }

    setLoading(true)
    const { error } = await supabase.from('auditorias' as any).insert({
      usuario_id: user?.id,
      cliente_id: clienteId,
      norma,
      data_auditoria: dataAuditoria,
      auditor_id: auditorId,
      escopo,
      status: 'planejada',
    })
    setLoading(false)

    if (error) {
      toast.error('Erro ao cadastrar auditoria', { description: error.message })
    } else {
      toast.success('Auditoria cadastrada com sucesso!')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="norma">Norma *</Label>
            <Select value={norma} onValueChange={setNorma}>
              <SelectTrigger id="norma">
                <SelectValue placeholder="Selecione a norma" />
              </SelectTrigger>
              <SelectContent>
                {['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO/IEC 17020', 'ISO/IEC 17025'].map(
                  (n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data da Auditoria *</Label>
            <Input
              id="data"
              type="date"
              value={dataAuditoria}
              onChange={(e) => setDataAuditoria(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auditor">Auditor Responsável *</Label>
            <Select value={auditorId} onValueChange={setAuditorId}>
              <SelectTrigger id="auditor">
                <SelectValue placeholder="Selecione o auditor" />
              </SelectTrigger>
              <SelectContent>
                {auditors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="escopo">Escopo</Label>
          <Textarea
            id="escopo"
            placeholder="Descreva o escopo da auditoria..."
            value={escopo}
            onChange={(e) => setEscopo(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando
            </>
          ) : (
            'Salvar Auditoria'
          )}
        </Button>
      </div>
    </form>
  )
}
