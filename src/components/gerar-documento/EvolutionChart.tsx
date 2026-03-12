import { useState, useRef, useMemo } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { LineChart as ChartIcon, Download, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface EvolutionChartProps {
  data: any[]
  dateCol: string
  numericCols: string[]
  onImageGenerated: (base64: string | null) => void
}

export function EvolutionChart({
  data,
  dateCol,
  numericCols,
  onImageGenerated,
}: EvolutionChartProps) {
  const [selectedY, setSelectedY] = useState<string[]>(numericCols.slice(0, 1))
  const [includeInDoc, setIncludeInDoc] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleImageUpdate = async (keys: string[]) => {
    if (keys.length === 0) {
      onImageGenerated(null)
      return
    }
    setIsGenerating(true)
    try {
      const { data: resData, error } = await supabase.functions.invoke('generate-chart-image', {
        body: { data, xAxisKey: dateCol, yAxisKeys: keys },
      })
      if (error) throw error
      onImageGenerated(resData.base64)
    } catch (err: any) {
      toast.error('Erro ao gerar gráfico remoto', { description: err.message })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleY = (col: string) => {
    setSelectedY((prev) => {
      const next = prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      if (includeInDoc) handleImageUpdate(next)
      return next
    })
  }

  const handleIncludeToggle = async (checked: boolean) => {
    setIncludeInDoc(checked)
    if (!checked) {
      onImageGenerated(null)
      return
    }
    if (selectedY.length === 0) {
      toast.error('Selecione pelo menos uma métrica.')
      setIncludeInDoc(false)
      return
    }
    await handleImageUpdate(selectedY)
    if (checked) {
      toast.success('Gráfico vinculado ao documento.', {
        description: 'Utilize a tag {%grafico_evolucao} no template Word.',
      })
    }
  }

  const exportChart = (format: 'png' | 'svg') => {
    const svgElement = chartRef.current?.querySelector('svg')
    if (!svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evolucao_${Date.now()}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        if (ctx) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          const url = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = url
          a.download = `evolucao_${Date.now()}.png`
          a.click()
        }
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
    }
  }

  const chartConfig = useMemo(() => {
    const cfg: Record<string, any> = {}
    selectedY.forEach((k, i) => {
      cfg[k] = { label: k, color: `hsl(var(--chart-${(i % 5) + 1}))` }
    })
    return cfg
  }, [selectedY])

  return (
    <Card className="shadow-sm border-border animate-fade-in-up mt-6 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 bg-muted/20 border-b">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChartIcon className="h-5 w-5 text-primary" />
            Evolução de Dados
          </CardTitle>
          <CardDescription>
            Visualize tendências e inclua insights visuais nos documentos
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex items-center space-x-2 bg-background border px-3 py-1.5 rounded-md">
            <Switch
              id="include-doc"
              checked={includeInDoc}
              onCheckedChange={handleIncludeToggle}
              disabled={isGenerating}
            />
            <label htmlFor="include-doc" className="text-sm font-medium cursor-pointer">
              Incluir no Documento
            </label>
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-background">
                <Download className="h-4 w-4" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportChart('png')}>
                Salvar como PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportChart('svg')}>
                Salvar como SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Séries de Dados (Eixo Y):
          </h4>
          <div className="flex flex-wrap gap-4 bg-muted/10 p-3 rounded-md border border-dashed">
            {numericCols.map((col) => (
              <label
                key={col}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 px-2 rounded transition-colors"
              >
                <Checkbox
                  checked={selectedY.includes(col)}
                  onCheckedChange={() => toggleY(col)}
                  disabled={isGenerating}
                />
                <span className="text-sm font-medium select-none">{col}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedY.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center border border-dashed rounded-md text-muted-foreground bg-muted/5">
            Selecione pelo menos uma métrica para exibir o gráfico.
          </div>
        ) : (
          <div ref={chartRef} className="h-[400px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={dateCol} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {selectedY.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`var(--color-${key})`}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
