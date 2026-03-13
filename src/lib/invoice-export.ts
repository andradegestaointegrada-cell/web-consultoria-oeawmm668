import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const getInvoiceHtml = (invoice: any, clientName: string) => {
  const faturaNo = invoice.id.split('-')[0].toUpperCase()
  const dataEmissao = format(new Date(invoice.data_emissao), 'dd/MM/yyyy', { locale: ptBR })

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <title>Fatura ${faturaNo}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; line-height: 1.5; padding: 20px; }
        .header { display: flex; align-items: center; border-bottom: 3px solid #6D28D9; padding-bottom: 20px; margin-bottom: 40px; }
        .title { color: #6D28D9; font-size: 32px; font-weight: bold; margin: 0; }
        .meta-info { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; font-weight: bold; color: #475569; }
        table { w-full: 100%; border-collapse: collapse; margin-bottom: 40px; width: 100%; }
        th { background-color: #F8FAFC; color: #1E293B; text-align: left; padding: 12px; font-size: 14px; border-bottom: 2px solid #E2E8F0; }
        td { padding: 16px 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
        .total-row { border-top: 2px solid #94A3B8; font-weight: bold; font-size: 16px; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px; }
        .bank-details h3, .payable-to h3 { color: #6D28D9; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }
        .contact { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; }
        .brand-text { color: #6D28D9; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Andrade Gestão Integrada</h1>
      </div>
      
      <div style="margin-bottom: 20px;">
        <strong>Cliente:</strong> ${clientName}<br/>
        <strong>CNPJ:</strong> ${invoice.cnpj_cliente}
      </div>

      <div class="meta-info" style="display: table; width: 100%; margin-bottom: 30px;">
        <div style="display: table-cell; text-align: left;">FATURA SETEC HB NO. ${faturaNo}</div>
        <div style="display: table-cell; text-align: right;">DATA: ${dataEmissao}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>DESCRIÇÃO DO SERVIÇO</th>
            <th style="text-align: center;">QTD.</th>
            <th style="text-align: right;">PREÇO</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.descricao || invoice.servico}</td>
            <td style="text-align: center;">01</td>
            <td style="text-align: right;">${formatCurrency(invoice.valor)}</td>
            <td style="text-align: right;">${formatCurrency(invoice.valor)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"></td>
            <td style="text-align: right; padding-top: 20px;">TOTAL GERAL</td>
            <td style="text-align: right; padding-top: 20px;">${formatCurrency(invoice.valor)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer" style="display: table; width: 100%;">
        <div class="bank-details" style="display: table-cell; width: 50%;">
          <h3>DADOS BANCÁRIOS</h3>
          <p>Banco Cora<br/>Ag 0001 - c/c 2014987-0</p>
        </div>
        <div class="payable-to" style="display: table-cell; width: 50%; padding-left: 20px;">
          <h3>PAGÁVEL A:</h3>
          <p>Andrade Gestão Integrada e Treinamento</p>
        </div>
      </div>

      <div class="contact">
        andrade.gestaointegrada@gmail.com | Fone: (11) 98613-4789<br/>
        <span class="brand-text">www.linkedin.com/in/alexandreandradegestaodeprojetos</span>
      </div>
    </body>
    </html>
  `
}

export const exportInvoiceToWord = (invoice: any, clientName: string) => {
  const htmlContent = getInvoiceHtml(invoice, clientName)
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' })

  const fileName = `Fatura_${clientName.replace(/\s+/g, '_')}_${invoice.id.split('-')[0]}.doc`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportInvoiceToPDF = (invoice: any, clientName: string) => {
  const htmlContent = getInvoiceHtml(invoice, clientName)

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
