export interface ExportContent {
  titulo: string
  introducao: string
  secoes: { subtitulo: string; conteudo: string }[]
  conclusao: string
}

const sanitizeForWord = (html: string) => {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '<br/>')
    .replace(/<hr\s*\/?>/gi, '<hr/>')
    .replace(/<img([^>]+)>/gi, (match, p1) => (p1.endsWith('/') ? match : `<img${p1}/>`))
    .replace(/&nbsp;/g, '&#160;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

export const exportToWord = (content: ExportContent) => {
  const { titulo, introducao, secoes, conclusao } = content

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <title>${sanitizeForWord(titulo)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #000; }
        h1 { font-size: 24pt; color: #111; margin-bottom: 20px; font-weight: bold; }
        h2 { font-size: 18pt; color: #222; margin-top: 24px; margin-bottom: 12px; font-weight: bold; }
        p { margin-bottom: 12px; }
        ul, ol { margin-bottom: 12px; margin-left: 24px; }
        li { margin-bottom: 6px; }
        b, strong { font-weight: bold; }
        i, em { font-style: italic; }
        u { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>${sanitizeForWord(titulo)}</h1>
      ${introducao ? `<div>${sanitizeForWord(introducao)}</div>` : ''}
      ${secoes
        .map(
          (s) => `
        <h2>${sanitizeForWord(s.subtitulo)}</h2>
        <div>${sanitizeForWord(s.conteudo)}</div>
      `,
        )
        .join('')}
      ${conclusao ? `<div style="margin-top: 24px;">${sanitizeForWord(conclusao)}</div>` : ''}
    </body>
    </html>
  `

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  const date = new Date()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  const normalizedTitle = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const fileName = `${normalizedTitle || 'Documento'}_${dd}_${mm}_${yyyy}.docx`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
