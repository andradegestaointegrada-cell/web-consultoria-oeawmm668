import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

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
  onSuccess?: () => void
}

export function EmailDispatchDialog({
  isOpen,
  onOpenChange,
  documentIds,
  onSuccess,
}: EmailDispatchDialogProps) {
  const [isSending, setIsSending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      subject: 'Seus Documentos Gerados - AGI Consult',
      message:
        'Olá,\n\nSegue em anexo os documentos gerados pelo nosso sistema.\n\nAtenciosamente,\nEquipe AGI Consult',
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (documentIds.length === 0) {
      toast.error('Nenhum documento selecionado para envio.')
      return
    }

    setIsSending(true)
    try {
      // 1. Atualiza status no banco para 'pendente'
      // Need to cast to any since we updated the DB schema manually and types.ts wasn't regenerated
      await supabase
        .from('documento_gerado')
        .update({ status_envio: 'pendente' } as any)
        .in('id', documentIds)

      // 2. Dispara a Edge Function
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

      // 3. Atualiza status para 'enviado'
      await supabase
        .from('documento_gerado')
        .update({
          status_envio: 'enviado',
          data_envio: new Date().toISOString(),
        } as any)
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
      // Volta status para 'erro' em caso de falha
      await supabase
        .from('documento_gerado')
        .update({ status_envio: 'erro' } as any)
        .in('id', documentIds)

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
            Preencha os dados abaixo para enviar {documentIds.length} documento(s) gerado(s)
            diretamente para o cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
