import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  subject: z.string().min(3, { message: 'O assunto deve ter pelo menos 3 caracteres.' }),
  message: z.string().min(5, { message: 'A mensagem deve ter pelo menos 5 caracteres.' }),
})

type FormValues = z.infer<typeof formSchema>

interface EmailDispatchDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  documentIds: string[]
  rowData?: any
  onSuccess?: () => void
}

export function EmailDispatchDialog({
  isOpen,
  onOpenChange,
  documentIds,
  rowData,
  onSuccess,
}: EmailDispatchDialogProps) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      subject: 'Seus Documentos Gerados - AGI Consult',
      message:
        'Olá,\n\nSegue em anexo os documentos gerados pelo nosso sistema.\n\nAtenciosamente,\nEquipe AGI Consult',
    },
  })

  useEffect(() => {
    if (isOpen && user) {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true)
        const { data } = await supabase
          .from('email_templates')
          .select('*')
          .eq('usuario_id', user.id)
          .order('nome')

        if (data) setTemplates(data)
        setIsLoadingTemplates(false)
      }
      fetchTemplates()
    }
  }, [isOpen, user])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    const replacePlaceholders = (text: string) => {
      if (!text) return ''
      let replaced = text

      const context = {
        cliente:
          rowData?.cliente ||
          rowData?.Cliente ||
          rowData?.['Nome do Cliente'] ||
          rowData?.nome ||
          rowData?.Nome ||
          '',
        data: rowData?.data || rowData?.Data || new Date().toLocaleDateString('pt-BR'),
        valor: rowData?.valor || rowData?.Valor || rowData?.['Valor Total'] || '',
        documento: 'Documento Gerado',
      }

      replaced = replaced.replace(/\{\{cliente\}\}/gi, context.cliente)
      replaced = replaced.replace(/\{\{data\}\}/gi, context.data)
      replaced = replaced.replace(/\{\{valor\}\}/gi, context.valor)
      replaced = replaced.replace(/\{\{documento\}\}/gi, context.documento)

      if (rowData) {
        Object.keys(rowData).forEach((key) => {
          const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'gi')
          replaced = replaced.replace(regex, String(rowData[key] || ''))
        })
      }

      return replaced
    }

    form.setValue('subject', replacePlaceholders(template.assunto))
    form.setValue('message', replacePlaceholders(template.corpo))
  }

  const onSubmit = async (values: FormValues) => {
    if (documentIds.length === 0) {
      toast.error('Nenhum documento selecionado para envio.')
      return
    }

    setIsSending(true)
    try {
      await supabase
        .from('documento_gerado')
        .update({ status_envio: 'pendente' })
        .in('id', documentIds)

      const { data, error } = await supabase.functions.invoke('send-email-document', {
        body: {
          documentIds,
          email: values.email,
          subject: values.subject,
          message: values.message,
        },
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      await supabase
        .from('documento_gerado')
        .update({
          status_envio: 'enviado',
          data_envio: new Date().toISOString(),
        })
        .in('id', documentIds)

      toast.success(
        data?.mocked
          ? 'E-mail simulado com sucesso (Chave API ausente)'
          : 'E-mail enviado com sucesso!',
      )
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      await supabase.from('documento_gerado').update({ status_envio: 'erro' }).in('id', documentIds)

      toast.error('Falha ao enviar e-mail', {
        description: err.message,
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Documento(s) por E-mail
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo ou selecione um template para enviar {documentIds.length}{' '}
            documento(s) gerado(s).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <FormLabel>Carregar Template (Opcional)</FormLabel>
              <Select onValueChange={handleTemplateSelect} disabled={isLoadingTemplates}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingTemplates ? 'Carregando...' : 'Selecione um template...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                  {templates.length === 0 && !isLoadingTemplates && (
                    <SelectItem value="none" disabled>
                      Nenhum template cadastrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

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

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Assunto do e-mail" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escreva sua mensagem aqui..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar E-mail
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
