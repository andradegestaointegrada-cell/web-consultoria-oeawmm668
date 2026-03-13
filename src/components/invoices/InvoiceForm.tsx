import { useState } from 'react'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const invoiceSchema = z.object({
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  cnpj_cliente: z.string().min(14, 'CNPJ inválido'),
  data_emissao: z.date({ required_error: 'Data de emissão é obrigatória' }),
  data_vencimento: z.date({ required_error: 'Data de vencimento é obrigatória' }),
  servico: z.enum(['consultoria', 'auditoria', 'treinamento'], {
    required_error: 'Selecione o serviço',
  }),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  descricao: z.string().min(5, 'Descrição muito curta'),
  centro_custo: z.string().min(1, 'Centro de custo é obrigatório'),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  projects: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function InvoiceForm({ projects, onSuccess, onCancel }: InvoiceFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      valor: 0,
      descricao: '',
      centro_custo: '',
      cnpj_cliente: '',
    },
  })

  const onSubmit = async (data: InvoiceFormValues) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('invoices' as any).insert({
        usuario_id: user.id,
        cliente_id: data.cliente_id,
        cnpj_cliente: data.cnpj_cliente,
        data_emissao: format(data.data_emissao, 'yyyy-MM-dd'),
        data_vencimento: format(data.data_vencimento, 'yyyy-MM-dd'),
        servico: data.servico,
        valor: data.valor,
        descricao: data.descricao,
        centro_custo: data.centro_custo,
        status: 'emitida',
      })

      if (error) throw error

      toast.success('Fatura criada com sucesso!')
      onSuccess()
    } catch (err: any) {
      toast.error('Erro ao criar fatura', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter distinct clients from projects to avoid duplicates in dropdown
  const uniqueClients = Array.from(
    new Map(projects.filter((p) => p.cliente).map((p) => [p.cliente, p])).values(),
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uniqueClients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnpj_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_emissao"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Emissão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data_vencimento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="servico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                    <SelectItem value="auditoria">Auditoria</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="centro_custo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro de Custo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: C-001 Operações" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os serviços prestados..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Fatura
          </Button>
        </div>
      </form>
    </Form>
  )
}
