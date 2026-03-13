import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mapping } = await req.json()

    if (!mapping || !Array.isArray(mapping)) {
      throw new Error('Formato inválido: mapping deve ser um array.')
    }

    const validTypes = ['Texto', 'Número', 'Data', 'Email']

    for (const item of mapping) {
      if (!item.placeholder || typeof item.placeholder !== 'string') {
        throw new Error('Placeholder inválido ou ausente no mapeamento.')
      }
      if (!item.column || typeof item.column !== 'string') {
        throw new Error(`Coluna inválida ou ausente para o placeholder {{${item.placeholder}}}.`)
      }
      if (!item.type || !validTypes.includes(item.type)) {
        throw new Error(`Tipo de dado inválido para o placeholder {{${item.placeholder}}}. Permitidos: ${validTypes.join(', ')}.`)
      }
    }

    return new Response(JSON.stringify({ valid: true, message: 'Mapeamento validado com sucesso' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ valid: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
