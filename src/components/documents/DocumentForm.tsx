import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

export function DocumentForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1)

  const handleNext = () => setStep(2)
  const handleGenerate = () => {
    setStep(3)
    setTimeout(() => {
      toast.success('Documento gerado com sucesso!')
      onSuccess()
    }, 1500)
  }

  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in-95">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Tudo Pronto!</h3>
        <p className="text-muted-foreground text-center">
          Seu documento foi gerado e está pronto para download.
        </p>
        <Button onClick={onSuccess} className="mt-4">
          Fechar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <span
          className={`px-2 py-1 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-slate-100'}`}
        >
          1. Dados Básicos
        </span>
        <div className="h-px w-8 bg-border" />
        <span
          className={`px-2 py-1 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-slate-100'}`}
        >
          2. Detalhes
        </span>
      </div>

      {step === 1 ? (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="space-y-2">
            <Label>Nome do Cliente / Empresa</Label>
            <Input placeholder="Ex: Tech Solutions Ltda" />
          </div>
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input placeholder="Ex: Carlos Mendes" />
          </div>
          <Button onClick={handleNext} className="w-full">
            Próximo Passo
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="space-y-2">
            <Label>Nível de Criticidade</Label>
            <Select defaultValue="medio">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observações Adicionais</Label>
            <Input placeholder="Detalhes opcionais..." />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Voltar
            </Button>
            <Button onClick={handleGenerate} className="w-full">
              Gerar Documento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
