import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Progress } from '@/components/ui/progress'

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
  FormDescription,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  templateId: z.string().min(1, 'Selecione um template de e-mail.'),
  emailColumn: z.string().min(1, 'Selecione a coluna que contém os e-mails.'),
})

type FormValues = z.infer<typeof formSchema>

interface BatchEmailDispatchDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  batchItems: { id: string; row: any }[]
  onSuccess?: () => void
}

export function BatchEmailDispatchDialog({
  isOpen,
  onOpenChange,
  batchItems,
  onSuccess,
}: BatchEmailDispatchDialogProps) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, errors: 0 })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { templateId: '', emailColumn: '' },
  })

  useEffect(() => {
    if (isOpen && batchItems.length > 0) {
      const cols = Object.keys(batchItems[0].row)
      const detected = cols.find(
        (c) =>
          c.toLowerCase().includes('email') ||
          c.toLowerCase().includes('e-mail') ||
          c.toLowerCase() === 'contato',
      )
      form.reset({ templateId: '', emailColumn: detected || '' })
      setProgress({ current: 0, total: 0, errors: 0 })
    }
  }, [isOpen, batchItems, form])

  useEffect(() => {
    if (isOpen && user) {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true)
        const { data } = await supabase
          .from('email_templates' as any)
          .select('*')
          .eq('usuario_id', user.id)
          .order('nome')
        if (data) setTemplates(data)
        setIsLoadingTemplates(false)
      }
      fetchTemplates()
    }
  }, [isOpen, user])

  const columns = batchItems.length > 0 ? Object.keys(batchItems[0].row) : []

  const onSubmit = async (values: FormValues) => {
    if (batchItems.length === 0) return

    const selectedTemplate = templates.find((t) => t.id === values.templateId)
    if (!selectedTemplate) return

    setIsSending(true)
    setProgress({ current: 0, total: batchItems.length, errors: 0 })
    let errorCount = 0

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]
      const targetEmail = item.row[values.emailColumn]

      const replacePlaceholders = (text: string, rowData: any) => {
        if (!text) return ''
        let replaced = text
        const ctx = {
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
        replaced = replaced.replace(/{{cliente}}/gi, ctx.cliente)
        replaced = replaced.replace(/{{data}}/gi, ctx.data)
        replaced = replaced.replace(/{{valor}}/gi, ctx.valor)
        replaced = replaced.replace(/{{documento}}/gi, ctx.documento)

        Object.keys(rowData).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, 'gi')
          replaced = replaced.replace(regex, String(rowData[key] || ''))
        })
        return replaced
      }

      if (!targetEmail) {
        errorCount++
        await supabase
          .from('documento_gerado')
          .update({ status_envio: 'erro' } as any)
          .eq('id', item.id)
      } else {
        try {
          await supabase
            .from('documento_gerado')
            .update({ status_envio: 'pendente' } as any)
            .eq('id', item.id)

          const subject = replacePlaceholders(selectedTemplate.assunto, item.row)
          const message = replacePlaceholders(selectedTemplate.corpo, item.row)

          const { data, error } = await supabase.functions.invoke('send-email-document', {
            body: { documentIds: [item.id], email: targetEmail, subject, message },
          })

          if (error || data?.error) throw new Error(error?.message || data?.error)

          await supabase
            .from('documento_gerado')
            .update({
              status_envio: 'enviado',
              data_envio: new Date().toISOString(),
            } as any)
            .eq('id', item.id)
        } catch (err) {
          console.error(`Falha no envio para ${targetEmail}`, err)
          errorCount++
          await supabase
            .from('documento_gerado')
            .update({ status_envio: 'erro' } as any)
            .eq('id', item.id)
        }
      }
      setProgress((prev) => ({ ...prev, current: i + 1, errors: errorCount }))
    }

    setIsSending(false)

    if (errorCount === 0) {
      toast.success('Envio em lote concluído!', {
        description: `Todos os ${batchItems.length} e-mails foram enviados com sucesso.`,
      })
    } else {
      toast.warning('Envio em lote com falhas', {
        description: `${batchItems.length - errorCount} enviados, ${errorCount} falharam.`,
      })
    }

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSending) onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Envio de E-mails em Lote
          </DialogTitle>
          <DialogDescription>
            Configure o disparo sequencial para {batchItems.length} documento(s).
          </DialogDescription>
        </DialogHeader>

        {isSending ? (
          <div className="space-y-4 py-6">
            <div className="flex justify-between text-sm font-medium">
              <span>Enviando e-mails...</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} />
            {progress.errors > 0 && (
              <p className="text-sm text-destructive mt-2">
                {progress.errors} falha(s) registrada(s).
              </p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template de E-mail</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingTemplates}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingTemplates ? 'Carregando...' : 'Selecione um template...'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coluna de E-mail</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a coluna..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Coluna da planilha com o endereço de destino para cada registro.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!form.formState.isValid}>
                  <Send className="mr-2 h-4 w-4" /> Disparar Lote
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
