import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentIds, email, subject, message } = await req.json()

    if (!documentIds || !email) {
      throw new Error('Parâmetros obrigatórios ausentes: documentIds, email')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const attachments = []

    // Fetch document metadata to get storage paths
    const { data: docs, error: docsError } = await supabase
      .from('documento_gerado')
      .select('id, arquivo_url')
      .in('id', documentIds)

    if (docsError) throw docsError

    // Download each file and convert to base64
    for (const doc of docs) {
      // Basic check to ensure it's a valid storage path (e.g., "user-id/timestamp_filename.docx")
      if (!doc.arquivo_url || doc.arquivo_url.indexOf('/') === -1) {
        console.warn(
          `Pulando documento ${doc.id} - caminho inválido (possivelmente gerado antes da feature de email)`,
        )
        continue
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from('generated_docs')
        .download(doc.arquivo_url)

      if (fileError || !fileData) {
        console.error(`Erro ao baixar ${doc.arquivo_url}:`, fileError)
        continue
      }

      const arrayBuffer = await fileData.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      let binary = ''
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i])
      }
      const base64Data = btoa(binary)

      let fileName = doc.arquivo_url.split('/').pop() || 'documento.docx'
      // Remove the timestamp prefix for the email attachment name if it exists
      fileName = fileName.replace(/^\d+_/, '')

      attachments.push({
        filename: fileName,
        content: base64Data,
      })
    }

    if (attachments.length === 0) {
      throw new Error('Nenhum documento válido encontrado no Storage para enviar.')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // Fallback logic if Resend API key is not configured (useful for preview environments)
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY não configurada. Simulando envio de e-mail com sucesso.')
      console.log(`Anexos processados: ${attachments.length}`)
      return new Response(
        JSON.stringify({
          success: true,
          mocked: true,
          message: 'Envio simulado com sucesso (Chave da API não configurada no Edge)',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Call Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sistema Consultoria <onboarding@resend.dev>', // Resend testing domain
        to: [email],
        subject: subject || 'Seus Documentos Gerados',
        html: `<p>${(message || 'Segue em anexo os documentos solicitados.').replace(/\n/g, '<br/>')}</p>`,
        attachments: attachments,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Erro no provedor de e-mail (Resend): ${errText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Erro na função send-email-document:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
