import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch documents with failed deliveries and less than 3 attempts
    const { data: docs, error: fetchError } = await supabase
      .from('documento_gerado')
      .select('id, tentativas_envio')
      .eq('status_envio', 'erro')
      .lt('tentativas_envio', 3)

    if (fetchError) throw fetchError

    if (!docs || docs.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum documento pendente para reenvio.', processed: 0 }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const results = []

    for (const doc of docs) {
      try {
        // Fetch the original destination from agendamentos_email
        const { data: agendamento, error: agendamentoError } = await supabase
          .from('agendamentos_email')
          .select('destinatario, template_id')
          .eq('documento_id', doc.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (agendamentoError || !agendamento) {
          throw new Error('Destinatário original não encontrado para o reenvio.')
        }

        // Fetch the email template used
        const { data: template } = await supabase
          .from('email_templates')
          .select('assunto, corpo')
          .eq('id', agendamento.template_id)
          .single()

        const subject = template?.assunto || 'Reenvio de Documento'
        const message = template?.corpo || 'Segue o documento reenviado automaticamente.'

        // Trigger the email sending function
        const res = await fetch(`${supabaseUrl}/functions/v1/send-email-document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentIds: [doc.id],
            email: agendamento.destinatario,
            subject,
            message
          })
        })

        const success = res.ok
        const newTentativas = (doc.tentativas_envio || 0) + 1
        const newStatus = success ? 'enviado' : 'erro'

        // Update document status
        await supabase
          .from('documento_gerado')
          .update({
            tentativas_envio: newTentativas,
            ultima_tentativa: new Date().toISOString(),
            status_envio: newStatus
          })
          .eq('id', doc.id)

        results.push({ id: doc.id, success, tentativas: newTentativas })
      } catch (err: any) {
        console.error(`Erro no reenvio automático do documento ${doc.id}:`, err)
        
        const newTentativas = (doc.tentativas_envio || 0) + 1
        await supabase
          .from('documento_gerado')
          .update({
            tentativas_envio: newTentativas,
            ultima_tentativa: new Date().toISOString()
          })
          .eq('id', doc.id)

        results.push({ id: doc.id, success: false, error: err.message, tentativas: newTentativas })
      }
    }

    return new Response(JSON.stringify({ processed: docs.length, results }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
