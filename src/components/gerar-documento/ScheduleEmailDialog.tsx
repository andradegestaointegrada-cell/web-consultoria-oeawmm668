import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Clock, Loader2, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

const formSchema = z.object({
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  templateId: z.string().min(1, { message: 'Selecione um template.' }),
  date: z.date({ required_error: 'Selecione a data de envio.' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido.' }),
})
type FormValues = z.infer<typeof formSchema>

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
  rowData?: any
  onSuccess?: () => void
}

export function ScheduleEmailDialog({
  isOpen,
  onOpenChange,
  documentId,
  rowData,
  onSuccess,
}: Props) {
  const { user } = useAuth()
  const [isScheduling, setIsScheduling] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', templateId: '', time: '09:00' },
  })

  useEffect(() => {
    if (isOpen && user) {
      supabase
        .from('email_templates')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome')
        .then(({ data }) => data && setTemplates(data))

      const potentialEmail = rowData?.email || rowData?.Email || rowData?.['E-mail'] || ''
      if (potentialEmail) form.setValue('email', potentialEmail)
    }
  }, [isOpen, user, rowData, form])

  const onSubmit = async (values: FormValues) => {
    if (!documentId) return toast.error('Nenhum documento selecionado.')
    if (!user) return

    setIsScheduling(true)
    try {
      const { error } = await supabase.from('agendamentos_email').insert({
        documento_id: documentId,
        data_agendada: format(values.date, 'yyyy-MM-dd'),
        hora_agendada: values.time + ':00',
        template_id: values.templateId,
        destinatario: values.email,
        usuario_id: user.id,
      })

      if (error) throw error

      toast.success('Envio agendado com sucesso!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error('Falha ao agendar envio', { description: err.message })
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" /> Agendar Envio
          </DialogTitle>
          <DialogDescription>
            Escolha a data e hora em que este documento deve ser enviado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template de E-mail</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinatário</FormLabel>
                  <FormControl>
                    <Input placeholder="cliente@empresa.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Envio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-10',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'P', { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="time" {...field} className="pl-10" />
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isScheduling}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isScheduling}>
                {isScheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Agendando...
                  </>
                ) : (
                  <>
                    <CalendarClock className="mr-2 h-4 w-4" /> Confirmar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
