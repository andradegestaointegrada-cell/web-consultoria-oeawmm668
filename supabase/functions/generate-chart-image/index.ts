import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { data, xAxisKey, yAxisKeys } = await req.json()
    if (!data || !xAxisKey || !yAxisKeys || yAxisKeys.length === 0) {
      throw new Error('Parâmetros inválidos ou insuficientes para gerar o gráfico.')
    }

    const labels = data.map((d: any) => d[xAxisKey] || '')
    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(249, 115, 22)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(234, 179, 8)',
    ]

    const datasets = yAxisKeys.map((key: string, idx: number) => ({
      label: key,
      data: data.map((d: any) => {
        const val = Number(d[key])
        return isNaN(val) ? 0 : val
      }),
      borderColor: colors[idx % colors.length],
      backgroundColor: 'transparent',
      borderWidth: 2,
      fill: false,
    }))

    const chartConfig = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: false,
        plugins: {
          title: { display: true, text: 'Evolução de Indicadores', font: { size: 16 } },
          legend: { position: 'bottom' },
        },
        scales: {
          x: { display: true },
          y: { display: true, beginAtZero: true },
        },
      },
    }

    const response = await fetch('https://quickchart.io/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chartConfig,
        width: 800,
        height: 400,
        backgroundColor: 'white',
        format: 'png',
      }),
    })

    if (!response.ok) {
      const txt = await response.text()
      throw new Error(`Falha ao gerar gráfico: ${txt}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    const base64Data = btoa(binary)

    return new Response(JSON.stringify({ base64: base64Data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
