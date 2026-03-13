import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'

interface InvoiceFiltersProps {
  clients: { id: string; name: string }[]
  statusFilter: string
  setStatusFilter: (val: string) => void
  clientFilter: string
  setClientFilter: (val: string) => void
  search: string
  setSearch: (val: string) => void
  dateRange: DateRange | undefined
  setDateRange: (val: DateRange | undefined) => void
}

export function InvoiceFilters({
  clients,
  statusFilter,
  setStatusFilter,
  clientFilter,
  setClientFilter,
  search,
  setSearch,
  dateRange,
  setDateRange,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-card p-4 rounded-lg border shadow-sm">
      <div className="relative flex-1 w-full md:min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar centro de custo ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 w-full bg-background"
        />
      </div>
      <div className="w-full md:w-[180px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="emitida">Emitida</SelectItem>
            <SelectItem value="paga">Paga</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-[200px]">
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-auto">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>
      <Button
        variant="secondary"
        className="w-full md:w-auto shrink-0"
        onClick={() => {
          setStatusFilter('all')
          setClientFilter('all')
          setSearch('')
          setDateRange(undefined)
        }}
      >
        <Filter className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  )
}
