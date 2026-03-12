import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Info } from 'lucide-react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const formSchema = z.object({
  nome: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  assunto: z.string().min(2, { message: 'O assunto deve ter pelo menos 2 caracteres.' }),
  corpo: z.string().min(5, { message: 'O corpo do e-mail deve ter pelo menos 5 caracteres.' }),
})

type FormValues = z.infer<typeof formSchema>

interface EmailTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: any
  onSuccess: () => void
}

export function EmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: EmailTemplateDialogProps) {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      assunto: '',
      corpo: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (template) {
        form.reset({
          nome: template.nome,
          assunto: template.assunto,
          corpo: template.corpo,
        })
      } else {
        form.reset({
          nome: '',
          assunto: '',
          corpo: '',
        })
      }
    }
  }, [open, template, form])

  const onSubmit = async (values: FormValues) => {
    if (!user) return
    setIsSaving(true)

    try {
      if (template?.id) {
        const { error } = await supabase
          .from('email_templates' as any)
          .update({
            nome: values.nome,
            assunto: values.assunto,
            corpo: values.corpo,
          })
          .eq('id', template.id)
        if (error) throw error
        toast.success('Template atualizado com sucesso!')
      } else {
        const { error } = await supabase.from('email_templates' as any).insert({
          nome: values.nome,
          assunto: values.assunto,
          corpo: values.corpo,
          usuario_id: user.id,
        })
        if (error) throw error
        toast.success('Template criado com sucesso!')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao salvar template', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}
          </DialogTitle>
          <DialogDescription>
            Crie um modelo de e-mail com variáveis que serão substituídas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Template</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: E-mail de Contrato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assunto"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Assunto</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Você pode usar variáveis como {'{{cliente}}'} no assunto.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input placeholder="Documento para {{cliente}}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="corpo"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Corpo da Mensagem</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] text-sm space-y-2 p-3">
                          <p className="font-semibold">Variáveis disponíveis:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>
                              <code>{'{{cliente}}'}</code>: Nome do cliente
                            </li>
                            <li>
                              <code>{'{{data}}'}</code>: Data atual
                            </li>
                            <li>
                              <code>{'{{valor}}'}</code>: Valor do documento
                            </li>
                            <li>
                              <code>{'{{documento}}'}</code>: Nome do documento
                            </li>
                            <li>
                              <code>{'{{coluna_excel}}'}</code>: Qualquer coluna da base de dados
                            </li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Olá {{cliente}},&#10;&#10;Segue o documento atualizado..."
                      className="min-h-[200px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O documento gerado será anexado automaticamente a este e-mail.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  'Salvar Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
