import { useState } from 'react'
import { CalendarIcon, Loader2, Check, ChevronsUpDown, Plus } from 'lucide-react'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { QuickProjectDialog } from './QuickProjectDialog'

const invoiceSchema = z.object({
  cliente_id: z.string({ required_error: 'Selecione um cliente' }).min(1, 'Selecione um cliente'),
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
  onProjectCreated?: (project: any) => void
}

const formatCNPJ = (value: string) => {
  const v = value.replace(/\D/g, '')
  if (v.length <= 2) return v
  if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`
  if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`
  if (v.length <= 12) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`
  return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12, 14)}`
}

export function InvoiceForm({ projects, onSuccess, onCancel, onProjectCreated }: InvoiceFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { valor: 0, descricao: '', centro_custo: '', cnpj_cliente: '' },
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
        status: 'rascunho',
      })
      if (error) throw new Error(error.message)
      toast.success('Fatura criada com sucesso!')
      onSuccess()
    } catch (err: any) {
      toast.error('Erro ao criar fatura', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderDatePicker = (field: any, label: string) => (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
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
          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Cliente / Projeto</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? projects.find((p) => p.id === field.value)?.cliente ||
                              'Selecione o cliente'
                            : 'Selecione o cliente'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      style={{ width: 'var(--radix-popover-trigger-width)' }}
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Buscar cliente..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty className="py-2 text-sm text-center">
                            Nenhum cliente encontrado.
                            {searchQuery && (
                              <Button
                                variant="link"
                                className="p-0 h-auto mt-2 block w-full text-center"
                                onClick={() => {
                                  setNewProjectName(searchQuery)
                                  setIsProjectDialogOpen(true)
                                  setOpenCombobox(false)
                                }}
                              >
                                Criar "{searchQuery}"
                              </Button>
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {projects.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={`${p.cliente} ${p.projeto}`}
                                onSelect={() => {
                                  form.setValue('cliente_id', p.id)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    p.id === field.value ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                {p.cliente} {p.projeto ? `- ${p.projeto}` : ''}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setNewProjectName('')
                                setIsProjectDialogOpen(true)
                                setOpenCombobox(false)
                              }}
                              className="cursor-pointer font-medium text-[#6B46C1] aria-selected:text-[#6B46C1]"
                            >
                              <Plus className="mr-2 h-4 w-4" /> Cadastrar Novo Projeto
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj_cliente"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>CNPJ do Cliente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                    />
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
              render={({ field }) => renderDatePicker(field, 'Data de Emissão')}
            />
            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => renderDatePicker(field, 'Data de Vencimento')}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Fatura
            </Button>
          </div>
        </form>
      </Form>
      <QuickProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        initialClientName={newProjectName}
        onSuccess={(newProject) => {
          onProjectCreated?.(newProject)
          form.setValue('cliente_id', newProject.id)
          setIsProjectDialogOpen(false)
        }}
      />
    </>
  )
}
