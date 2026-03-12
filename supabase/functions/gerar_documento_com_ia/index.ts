import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { tipo_documento, nome_cliente, descricao_breve, dados_adicionais } = body

    if (!tipo_documento || !nome_cliente || !descricao_breve) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios ausentes: tipo_documento, nome_cliente, descricao_breve' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente do Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Você é um consultor especialista criando documentos profissionais.
Gere conteúdo estruturado em formato JSON para um documento de consultoria.
Tipo de Documento: ${tipo_documento}
Cliente: ${nome_cliente}
Descrição do Propósito: ${descricao_breve}
Dados Adicionais: ${dados_adicionais ? JSON.stringify(dados_adicionais) : 'Nenhum'}

Você DEVE retornar APENAS um objeto JSON válido. O JSON deve conter estritamente a seguinte estrutura:
{
  "titulo": "Um título profissional para o documento",
  "introducao": "Texto introdutório detalhado adaptado ao cliente e ao tipo de documento",
  "secoes": [
    {
      "subtitulo": "Título da Seção 1 (ex: Análise de Cenário)",
      "conteudo": "Conteúdo detalhado e profissional da Seção 1"
    },
    {
      "subtitulo": "Título da Seção 2 (ex: Plano de Ação)",
      "conteudo": "Conteúdo detalhado e profissional da Seção 2"
    }
  ],
  "conclusao": "Um resumo conclusivo ou próximos passos"
}

Não inclua blocos de código markdown (\`\`\`json) na resposta. Retorne apenas o texto JSON puro para que possa ser lido diretamente por JSON.parse().`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: 'Falha ao gerar conteúdo devido a um erro do provedor de IA.', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiText) {
      return new Response(
        JSON.stringify({ error: 'Nenhum conteúdo gerado pela IA.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(aiText)
    } catch (e) {
      let cleanText = aiText.trim()
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
      
      if (match && match[1]) {
        cleanText = match[1].trim()
      } else {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
      }
      
      try {
        parsedResult = JSON.parse(cleanText)
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'O conteúdo gerado não é um JSON válido.', rawText: aiText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify(parsedResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno no servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
