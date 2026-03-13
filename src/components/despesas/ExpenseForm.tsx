import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const getExpenseSchema = (projects: any[]) =>
  z.object({
    data: z.date({ required_error: 'Selecione a data da despesa.' }),
    categoria: z.enum(['transporte', 'hospedagem', 'alimentação', 'material', 'outros'], {
      required_error: 'Selecione uma categoria.',
    }),
    valor: z
      .string()
      .min(1, 'O valor é obrigatório.')
      .refine((val) => {
        const parsed = parseFloat(val.replace(',', '.'))
        return !isNaN(parsed) && parsed > 0
      }, 'Informe um valor numérico válido maior que zero.'),
    projeto_id: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val === 'none') return true
        const project = projects.find((p) => p.id === val)
        if (project?.isMock) return true
        return isUUID(val)
      }, 'O identificador do projeto é inválido.'),
    descricao: z.string().min(1, 'Informe a descrição da despesa.').trim(),
  })

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
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const expenseSchema = getExpenseSchema(projects)
  type ExpenseFormValues = z.infer<typeof expenseSchema>

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      valor: '',
      descricao: '',
      projeto_id: 'none',
    },
  })

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!user) return
    setLoading(true)

    try {
      let comprovante_url = null
      if (file) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(path, file)
        if (uploadError)
          throw new Error(`Erro ao fazer upload do comprovante: ${uploadError.message}`)
        comprovante_url = path
      }

      const selectedProject = projects.find((p) => p.id === values.projeto_id)
      const isMockProject = selectedProject?.isMock

      let validProjetoId = null
      if (values.projeto_id && values.projeto_id !== 'none' && !isMockProject) {
        if (isUUID(values.projeto_id)) {
          validProjetoId = values.projeto_id
        } else {
          throw new Error('invalid input syntax for type uuid')
        }
      }

      const parsedValor = parseFloat(values.valor.replace(',', '.'))
      const { error } = await supabase.from('despesas').insert({
        usuario_id: user.id,
        data: format(values.data, 'yyyy-MM-dd'),
        categoria: values.categoria,
        valor: parsedValor,
        descricao: values.descricao,
        projeto_id: validProjetoId,
        cliente_id: values.projeto_id !== 'none' ? selectedProject?.cliente : null,
        comprovante_url,
      })

      if (error) throw error

      toast.success('Despesa registrada com sucesso!')
      form.reset()
      setFile(null)
      onSuccess()
    } catch (error: any) {
      console.error('Erro no Supabase:', error)
      let friendlyMsg = 'Não foi possível registrar a despesa. Tente novamente.'
      if (
        error.message?.includes('invalid input syntax for type uuid') ||
        error.message?.includes('uuid')
      ) {
        friendlyMsg = 'Erro ao salvar despesa: O identificador do projeto é inválido.'
      }
      toast.error(friendlyMsg, { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione a data'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="hospedagem">Hospedagem</SelectItem>
                    <SelectItem value="alimentação">Alimentação</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$) *</FormLabel>
                <FormControl>
                  <Input placeholder="0.00" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projeto_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto Associado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.projeto} ({p.cliente})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes da despesa..." disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Anexar Comprovante (Opcional)</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="cursor-pointer file:cursor-pointer"
            />
          </FormControl>
          <p className="text-xs text-muted-foreground">Formatos suportados: PDF, JPG, PNG.</p>
        </FormItem>

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
    </Form>
  )
}
