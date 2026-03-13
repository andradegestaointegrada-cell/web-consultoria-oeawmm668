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

    // Config: 90 days retention policy
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    let deletedCount = 0

    // Fetch old documents from documento_gerado
    const { data: oldGenDocs, error: errGen } = await supabase
      .from('documento_gerado')
      .select('id, arquivo_url')
      .lt('data_geracao', ninetyDaysAgo.toISOString())
      .not('arquivo_url', 'is', null)

    if (errGen) throw errGen

    if (oldGenDocs && oldGenDocs.length > 0) {
      const urls = oldGenDocs.map((d) => d.arquivo_url).filter(Boolean) as string[]

      // Delete from storage buckets
      await supabase.storage.from('documentos').remove(urls)
      await supabase.storage.from('generated_docs').remove(urls)

      // Update DB
      const ids = oldGenDocs.map((d) => d.id)
      await supabase.from('documento_gerado').update({ arquivo_url: null }).in('id', ids)
      deletedCount += ids.length
    }

    // Optional: Also clean up old 'documentos' table records if needed
    const { data: oldStdDocs, error: errStd } = await supabase
      .from('documentos')
      .select('id, arquivo_url')
      .lt('data_criacao', ninetyDaysAgo.toISOString())
      .not('arquivo_url', 'is', null)

    if (!errStd && oldStdDocs && oldStdDocs.length > 0) {
      const stdUrls = oldStdDocs.map((d) => d.arquivo_url).filter(Boolean) as string[]
      await supabase.storage.from('documentos').remove(stdUrls)
      await supabase.storage.from('generated_docs').remove(stdUrls)

      const stdIds = oldStdDocs.map((d) => d.id)
      await supabase.from('documentos').update({ arquivo_url: null }).in('id', stdIds)
      deletedCount += stdIds.length
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Cleanup completed', deletedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
