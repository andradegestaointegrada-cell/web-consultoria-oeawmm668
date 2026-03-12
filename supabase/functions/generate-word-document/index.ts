import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import PizZip from 'npm:pizzip'
import Docxtemplater from 'npm:docxtemplater'
import ImageModule from 'npm:docxtemplater-image-module-free'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path, data: templateData } = await req.json()

    if (!path || !templateData) {
      throw new Error('Path and data are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data, error } = await supabase.storage.from('templates').download(path)
    if (error || !data) {
      throw new Error('Template not found in storage')
    }

    const arrayBuffer = await data.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    const imageOptions = {
      centered: false,
      getImage: function (tagValue: string) {
        if (!tagValue) return new Uint8Array(0)
        const base64Data = tagValue.replace(/^data:image\/\w+;base64,/, '')
        const binaryString = atob(base64Data)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes.buffer
      },
      getSize: function () {
        return [500, 300]
      },
    }

    const imageModule = new ImageModule(imageOptions)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    })

    doc.render(templateData)

    const generatedZip = doc.getZip().generate({
      type: 'base64',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    })

    return new Response(JSON.stringify({ base64: generatedZip }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
