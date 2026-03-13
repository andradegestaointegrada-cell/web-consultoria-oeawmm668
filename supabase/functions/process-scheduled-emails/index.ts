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

    // Ensure we check time against the default BRT timezone context since DATE/TIME stored are naive
    const spTimeStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    const spWallTime = new Date(spTimeStr)
    
    const yyyy = spWallTime.getFullYear()
    const mm = String(spWallTime.getMonth() + 1).padStart(2, '0')
    const dd = String(spWallTime.getDate()).padStart(2, '0')
    const hh = String(spWallTime.getHours()).padStart(2, '0')
    const min = String(spWallTime.getMinutes()).padStart(2, '0')
    const ss = String(spWallTime.getSeconds()).padStart(2, '0')

    const currentDate = `${yyyy}-${mm}-${dd}`
    const currentTime = `${hh}:${min}:${ss}`

    // Fetch all pending schedules for today or before
    const { data: schedules, error: fetchError } = await supabase
      .from('agendamentos_email')
      .select('id, documento_id, template_id, destinatario, data_agendada, hora_agendada')
      .eq('status', 'pendente')
      .lte('data_agendada', currentDate)

    if (fetchError) throw fetchError

    // Filter ensuring we only trigger events that have actually reached their scheduled time
    const validSchedules = schedules?.filter(s => {
      if (s.data_agendada < currentDate) return true
      if (s.data_agendada === currentDate && s.hora_agendada <= currentTime) return true
      return false
    }) || []

    if (validSchedules.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum agendamento pendente no momento', processed: 0 }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const results = []

    for (const schedule of validSchedules) {
      try {
        const { data: template, error: templateError } = await supabase
          .from('email_templates')
          .select('assunto, corpo')
          .eq('id', schedule.template_id)
          .single()

        if (templateError || !template) throw new Error('Template não encontrado')

        // Trigger send-email-document edge function
        const res = await fetch(`${supabaseUrl}/functions/v1/send-email-document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentIds: [schedule.documento_id],
            email: schedule.destinatario,
            subject: template.assunto,
            message: template.corpo
          })
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Falha ao enviar email: ${errText}`)
        }

        // Update status to 'enviado'
        await supabase
          .from('agendamentos_email')
          .update({ status: 'enviado' })
          .eq('id', schedule.id)

        results.push({ id: schedule.id, status: 'enviado' })
      } catch (err: any) {
        console.error(`Erro ao processar agendamento ${schedule.id}:`, err)
        // Update status to 'erro'
        await supabase
          .from('agendamentos_email')
          .update({ status: 'erro' })
          .eq('id', schedule.id)

        results.push({ id: schedule.id, status: 'erro', error: err.message })
      }
    }

    return new Response(JSON.stringify({ processed: validSchedules.length, results }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err: any) {
    console.error('Erro na função process-scheduled-emails:', err)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
