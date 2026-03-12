import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { StatusReportTask } from '@/types/editor'

interface Props {
  tasks: StatusReportTask[]
  onChange: (tasks: StatusReportTask[]) => void
  isReadOnly?: boolean
}

export function StatusReportTasks({ tasks, onChange, isReadOnly }: Props) {
  const addTask = () => {
    if (isReadOnly) return
    onChange([
      ...tasks,
      { id: Date.now().toString(), description: '', status: 'Não Iniciado', progress: 0 },
    ])
  }

  const updateTask = (id: string, field: keyof StatusReportTask, value: any) => {
    onChange(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const removeTask = (id: string) => {
    onChange(tasks.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Tarefas e Entregáveis do Período</h3>
        {!isReadOnly && (
          <Button size="sm" variant="secondary" onClick={addTask}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
          </Button>
        )}
      </div>
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Atividade</TableHead>
              <TableHead className="w-[25%]">Status</TableHead>
              <TableHead className="w-[15%] text-center">Progresso (%)</TableHead>
              {!isReadOnly && <TableHead className="w-[15%] text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isReadOnly ? 3 : 4}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhuma tarefa adicionada.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Input
                      disabled={isReadOnly}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      placeholder="Descrição da atividade..."
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      disabled={isReadOnly}
                      value={task.status}
                      onValueChange={(v) => updateTask(task.id, 'status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Não Iniciado">Não Iniciado</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                        <SelectItem value="Atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      disabled={isReadOnly}
                      type="number"
                      min="0"
                      max="100"
                      className="text-center"
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, 'progress', Number(e.target.value))}
                    />
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
