import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function BudgetDashboard({
  expenses,
  projects,
  onUpdate,
}: {
  expenses: any[]
  projects: any[]
  onUpdate: () => void
}) {
  const [editingProject, setEditingProject] = useState<any>(null)
  const [newBudget, setNewBudget] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setNewBudget(project.orcamento_previsto?.toString() || '0')
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!editingProject) return
    setLoading(true)
    const { error } = await supabase
      .from('projeto_status')
      .update({ orcamento_previsto: Number(newBudget) })
      .eq('id', editingProject.id)

    setLoading(false)
    if (error) {
      toast.error('Erro ao atualizar orçamento')
    } else {
      toast.success('Orçamento atualizado')
      setIsOpen(false)
      onUpdate()
    }
  }

  const projectBudgets = projects
    .map((p) => {
      const projectExpenses = expenses
        .filter((e) => e.projeto_id === p.id || (!e.projeto_id && e.cliente_id === p.cliente))
        .reduce((sum, e) => sum + Number(e.valor), 0)

      const budget = Number(p.orcamento_previsto) || 0
      const isOverBudget = budget > 0 && projectExpenses > budget
      const percentage =
        budget > 0 ? Math.min((projectExpenses / budget) * 100, 100) : projectExpenses > 0 ? 100 : 0

      return { ...p, budget, projectExpenses, isOverBudget, percentage }
    })
    .filter((p) => p.budget > 0 || p.projectExpenses > 0)

  if (projectBudgets.length === 0) return null

  const hasOverBudget = projectBudgets.some((p) => p.isOverBudget)

  return (
    <div className="mb-6 print-hidden animate-fade-in-up">
      {hasOverBudget && (
        <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Atenção: Orçamento Excedido</AlertTitle>
          <AlertDescription>
            Um ou mais projetos ultrapassaram o orçamento inicial previsto. Verifique os detalhes
            abaixo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectBudgets.map((p) => (
          <Card
            key={p.id}
            className={`shadow-sm border-border transition-all hover:shadow-md ${p.isOverBudget ? 'border-destructive/50 bg-destructive/5' : ''}`}
          >
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <CardTitle
                className="text-sm font-medium truncate pr-2"
                title={`${p.projeto} - ${p.cliente}`}
              >
                {p.projeto}{' '}
                <span className="text-muted-foreground text-xs font-normal">({p.cliente})</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleEdit(p)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p
                    className={`text-2xl font-bold ${p.isOverBudget ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      p.projectExpenses,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orçamento:{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      p.budget,
                    )}
                  </p>
                </div>
                {p.isOverBudget ? (
                  <Badge variant="destructive" className="ml-2 mb-1">
                    Acima do Orçamento
                  </Badge>
                ) : (
                  p.budget > 0 && (
                    <Badge className="ml-2 mb-1 bg-emerald-500 hover:bg-emerald-600 border-none">
                      Dentro do Orçamento
                    </Badge>
                  )
                )}
              </div>
              <Progress
                value={p.percentage}
                className={`h-2 mt-3 ${p.isOverBudget ? 'bg-destructive/20 [&>div]:bg-destructive' : ''}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Definir Orçamento Inicial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Projeto / Cliente</Label>
              <Input
                value={`${editingProject?.projeto || ''} (${editingProject?.cliente || ''})`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Orçamento (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                Salvar Orçamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
