import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function processMonthlyData(docs: any[]) {
  const monthly = docs.reduce((acc: any, doc: any) => {
    if (!doc.data_geracao) return acc
    const date = parseISO(doc.data_geracao)
    const monthKey = format(date, 'yyyy-MM')
    const monthLabel = format(date, 'MMM/yy', { locale: ptBR })

    if (!acc[monthKey]) {
      acc[monthKey] = { sortKey: monthKey, label: monthLabel, generated: 0, sent: 0 }
    }

    acc[monthKey].generated += 1
    if (doc.status_envio && doc.status_envio !== 'pendente') {
      acc[monthKey].sent += 1
    }

    return acc
  }, {})

  return Object.values(monthly).sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey))
}

export function processTemplateDistribution(docs: any[]) {
  const distribution = docs.reduce((acc: any, doc: any) => {
    const templates = Array.isArray(doc.templates) ? doc.templates[0] : doc.templates
    const type = templates?.tipo || 'Outros'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  return Object.entries(distribution)
    .map(([name, value], i) => ({ name, value: value as number, fill: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value)
}

export function processClientRanking(docs: any[]) {
  const clients = docs.reduce((acc: any, doc: any) => {
    const clientName = doc.nome_cliente || 'Desconhecido'
    acc[clientName] = (acc[clientName] || 0) + 1
    return acc
  }, {})

  return Object.entries(clients)
    .map(([client, count]) => ({ client, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}
