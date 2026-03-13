import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib'
import { encodeBase64 } from "jsr:@std/encoding/base64"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { expenses } = await req.json()
    if (!expenses || !Array.isArray(expenses)) {
      throw new Error('Parâmetro expenses é obrigatório e deve ser um array.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const { width, height } = page.getSize()

    page.drawText('Dossiê Financeiro Consolidado', { x: 50, y: height - 50, size: 18, font: boldFont })
    
    let y = height - 100
    page.drawText('Data', { x: 50, y, size: 11, font: boldFont })
    page.drawText('Categoria', { x: 130, y, size: 11, font: boldFont })
    page.drawText('Valor (R$)', { x: 230, y, size: 11, font: boldFont })
    page.drawText('Descrição', { x: 310, y, size: 11, font: boldFont })

    page.drawLine({
      start: { x: 50, y: y - 5 },
      end: { x: width - 50, y: y - 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    })

    y -= 25
    let total = 0

    for (const exp of expenses) {
      if (y < 50) {
        page = pdfDoc.addPage()
        y = height - 50
      }
      
      const dt = exp.data ? new Date(exp.data).toLocaleDateString('pt-BR') : '-'
      page.drawText(dt, { x: 50, y, size: 10, font })
      page.drawText((exp.categoria || '').substring(0, 15), { x: 130, y, size: 10, font })
      page.drawText(`${Number(exp.valor).toFixed(2)}`, { x: 230, y, size: 10, font })
      page.drawText((exp.descricao || '').substring(0, 45), { x: 310, y, size: 10, font })
      
      total += Number(exp.valor) || 0
      y -= 20
    }

    y -= 10
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: width - 50, y: y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    })
    
    y -= 25
    if (y < 50) {
        page = pdfDoc.addPage()
        y = height - 50
    }
    page.drawText(`Total Geral: R$ ${total.toFixed(2)}`, { x: 50, y, size: 14, font: boldFont })

    for (const exp of expenses) {
      if (exp.comprovante_url) {
        try {
          const { data, error } = await supabase.storage.from('comprovantes').download(exp.comprovante_url)
          if (data && !error) {
            const arrayBuffer = await data.arrayBuffer()
            const ext = exp.comprovante_url.split('.').pop()?.toLowerCase()
            let img
            
            if (ext === 'png') {
              img = await pdfDoc.embedPng(arrayBuffer)
            } else if (ext === 'jpg' || ext === 'jpeg') {
              img = await pdfDoc.embedJpg(arrayBuffer)
            } else if (ext === 'pdf') {
              const loadedPdf = await PDFDocument.load(arrayBuffer)
              const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices())
              copiedPages.forEach(p => pdfDoc.addPage(p))
              continue
            }

            if (img) {
              const imgPage = pdfDoc.addPage()
              imgPage.drawText(`Comprovante: ${exp.descricao} (R$ ${exp.valor})`, { x: 50, y: height - 50, size: 14, font: boldFont })
              
              const maxWidth = width - 100
              const maxHeight = height - 100
              const imgDims = img.scaleToFit(maxWidth, maxHeight)
              
              imgPage.drawImage(img, {
                x: 50 + (maxWidth - imgDims.width) / 2,
                y: height - 80 - imgDims.height,
                width: imgDims.width,
                height: imgDims.height,
              })
            }
          }
        } catch (e) {
          console.error("Erro ao embutir comprovante", exp.comprovante_url, e)
        }
      }
    }

    const pdfBytes = await pdfDoc.save()
    const base64Data = encodeBase64(pdfBytes)

    return new Response(JSON.stringify({ base64: base64Data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
