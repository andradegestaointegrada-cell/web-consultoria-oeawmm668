import { DateRange } from 'react-day-picker'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

interface HistoryFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  templateFilter: string
  setTemplateFilter: (id: string) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  templates: { id: string; nome: string }[]
}

export function HistoryFilters({
  searchTerm,
  setSearchTerm,
  templateFilter,
  setTemplateFilter,
  dateRange,
  setDateRange,
  templates,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por linha/referência..."
          className="pl-9 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[220px]">
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Todos os Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Templates</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DatePickerWithRange date={dateRange} setDate={setDateRange} />
    </div>
  )
}
