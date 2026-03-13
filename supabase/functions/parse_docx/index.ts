import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import PizZip from 'npm:pizzip'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path } = await req.json()

    if (!path) {
      throw new Error('Path is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase.storage.from('templates').download(path)
    if (error || !data) {
      throw new Error('File not found in storage')
    }

    const arrayBuffer = await data.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    
    // Extract document.xml which contains the text
    const xml = zip.file("word/document.xml")?.asText() || ""
    
    // Strip XML tags to merge broken placeholders like <w:t>{</w:t><w:t>{</w:t>var...
    const text = xml.replace(/<[^>]+>/g, '')
    
    // Find all placeholders formatted as {{variable}}
    const matches = text.match(/{{(.*?)}}/g) || []
    
    // Clean and deduplicate
    const placeholders = [...new Set(matches.map((m: string) => m.replace(/{{|}}/g, '').trim()))]

    return new Response(JSON.stringify({ placeholders }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
