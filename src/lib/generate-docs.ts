import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

export interface BatchProcessOptions {
  rows: any[]
  selectedRows: number[]
  template: any
  mappings: any[]
  uploadId: string
  userId: string
  chartImageBase64?: string | null
  onProgress?: (current: number, total: number) => void
}

export async function processBatchGeneration({
  rows,
  selectedRows,
  template,
  mappings,
  uploadId,
  userId,
  chartImageBase64,
  onProgress,
}: BatchProcessOptions) {
  const { default: JSZip } = await import(/* @vite-ignore */ 'https://esm.sh/jszip@3.10.1')
  const zip = new JSZip()
  let successCount = 0
  let errorCount = 0
  const documentIds: string[] = []
  const generatedItems: { id: string; row: any }[] = []

  for (let i = 0; i < selectedRows.length; i++) {
    const rowIdx = selectedRows[i]
    const row = rows[rowIdx]

    if (onProgress) onProgress(i + 1, selectedRows.length)

    const payloadData: Record<string, any> = {}
    mappings.forEach((m: any) => {
      payloadData[m.placeholder_nome] = row[m.coluna_excel_mapeada] || ''
    })

    if (chartImageBase64) {
      payloadData['grafico_evolucao'] = chartImageBase64
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-word-document', {
        body: { path: template.arquivo_docx_url, data: payloadData },
      })

      if (error) throw new Error(error.message)
      if (!data?.base64) throw new Error('Dados não retornados pela função de geração')

      const clienteStr =
        row['Nome'] ||
        row['Cliente'] ||
        row['nome'] ||
        template?.nome?.replace(/\s+/g, '_') ||
        `Cliente_${rowIdx}`
      const safeClienteStr = String(clienteStr)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
      const fileName = `Documento_${safeClienteStr}_${rowIdx}.docx`

      const byteChars = atob(data.base64)
      const byteNumbers = new Array(byteChars.length)
      for (let k = 0; k < byteChars.length; k++) byteNumbers[k] = byteChars.charCodeAt(k)
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      zip.file(fileName, blob)

      const storagePath = `${userId}/${Date.now()}_${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('generated_docs')
        .upload(storagePath, blob, {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: false,
        })

      if (uploadError)
        console.error(`Falha ao enviar arquivo pro Storage (${fileName}):`, uploadError)

      const { data: insertedDoc } = await supabase
        .from('documento_gerado')
        .insert({
          template_id: template.id,
          upload_excel_id: uploadId,
          linha_numero: rowIdx,
          usuario_id: userId,
          arquivo_url: uploadError ? fileName : storagePath,
        })
        .select('id')
        .single()

      if (insertedDoc) {
        documentIds.push(insertedDoc.id)
        generatedItems.push({ id: insertedDoc.id, row })
      }

      successCount++
    } catch (err) {
      console.error(`Falha ao gerar linha ${rowIdx}:`, err)
      errorCount++
    }
  }

  if (successCount > 0) {
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `Documentos_${format(new Date(), 'yyyy-MM-dd')}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { successCount, errorCount, documentIds, generatedItems }
}

export async function processSingleDocument(
  row: any,
  idx: number,
  template: any,
  mappings: any[],
  uploadId: string,
  userId: string,
  chartImageBase64?: string | null,
) {
  const payloadData: Record<string, any> = {}
  mappings.forEach((m: any) => {
    payloadData[m.placeholder_nome] = row[m.coluna_excel_mapeada] || ''
  })

  if (chartImageBase64) {
    payloadData['grafico_evolucao'] = chartImageBase64
  }

  const { data, error } = await supabase.functions.invoke('generate-word-document', {
    body: { path: template.arquivo_docx_url, data: payloadData },
  })

  if (error) throw new Error(error.message)
  if (!data?.base64) throw new Error('Dados não retornados pela função de geração')

  const byteChars = atob(data.base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  const clienteStr =
    row['Nome'] ||
    row['Cliente'] ||
    row['nome'] ||
    template?.nome?.replace(/\s+/g, '_') ||
    'Cliente'
  const safeClienteStr = String(clienteStr)
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
  const fileName = `Documento_${dateStr}_${safeClienteStr}.docx`

  const storagePath = `${userId}/${Date.now()}_${fileName}`
  const { error: uploadError } = await supabase.storage
    .from('generated_docs')
    .upload(storagePath, blob, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: false,
    })

  const { data: insertedDoc } = await supabase
    .from('documento_gerado')
    .insert({
      template_id: template.id,
      upload_excel_id: uploadId,
      linha_numero: idx,
      usuario_id: userId,
      arquivo_url: uploadError ? fileName : storagePath,
    })
    .select('id')
    .single()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return { documentId: insertedDoc?.id }
}
