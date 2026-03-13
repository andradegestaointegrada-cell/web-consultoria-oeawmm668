import { useState, useEffect } from 'react'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const quickProjectSchema = z.object({
  cliente: z.string().min(1, 'Nome do cliente é obrigatório'),
  projeto: z.string().min(1, 'Nome do projeto é obrigatório'),
  data_inicio: z.date({ required_error: 'Data de início é obrigatória' }),
  data_fim: z.date({ required_error: 'Data de fim é obrigatória' }),
})

type QuickProjectValues = z.infer<typeof quickProjectSchema>

interface QuickProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (project: any) => void
  initialClientName?: string
}

export function QuickProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  initialClientName = '',
}: QuickProjectDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuickProjectValues>({
    resolver: zodResolver(quickProjectSchema),
    defaultValues: { cliente: initialClientName, projeto: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        cliente: initialClientName,
        projeto: '',
        data_inicio: new Date(),
        data_fim: new Date(),
      })
    }
  }, [open, initialClientName, form])

  const onSubmit = async (data: QuickProjectValues) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const { data: newProject, error } = await supabase
        .from('projeto_status' as any)
        .insert({
          cliente: data.cliente,
          projeto: data.projeto,
          data_inicio: format(data.data_inicio, 'yyyy-MM-dd'),
          data_fim: format(data.data_fim, 'yyyy-MM-dd'),
          usuario_id: user.id,
          responsavel_id: user.id,
          status: 'em andamento',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Projeto criado com sucesso!')
      onSuccess(newProject)
    } catch (err: any) {
      toast.error('Erro ao criar projeto', { description: err.message })
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Projeto</DialogTitle>
          <DialogDescription>Crie um novo projeto para selecioná-lo na fatura.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => renderDatePicker(field, 'Data Início')}
              />
              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => renderDatePicker(field, 'Data Fim')}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Projeto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
