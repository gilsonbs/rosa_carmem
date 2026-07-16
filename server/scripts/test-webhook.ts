/**
 * Simula uma notificação de webhook do Mercado Pago contra o servidor local,
 * com uma assinatura x-signature válida (mesmo algoritmo usado pelo
 * WebhookSignatureValidator do SDK), para testar o fluxo de confirmação sem
 * depender do ngrok/painel do Mercado Pago estarem configurados.
 *
 * O servidor ainda faz uma chamada REAL à API do Mercado Pago
 * (payment.get) para buscar os detalhes do pagamento, então o payment_id
 * informado precisa existir de verdade na sua conta (sandbox ou produção).
 * Para conseguir um: faça uma compra de teste no Checkout Pro com um cartão
 * de teste do Mercado Pago e copie o "payment_id" da URL de redirecionamento
 * (/checkout/success?payment_id=...) ou do painel de pagamentos de teste.
 *
 * Uso:
 *   npx tsx server/scripts/test-webhook.ts <payment_id>
 */
import 'dotenv/config'
import { createHmac, randomUUID } from 'node:crypto'

const paymentId = process.argv[2]

if (!paymentId) {
  console.error('Uso: npx tsx server/scripts/test-webhook.ts <payment_id>')
  process.exit(1)
}

const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
if (!secret) {
  console.error('MERCADOPAGO_WEBHOOK_SECRET não configurado no .env')
  process.exit(1)
}

const port = process.env.SERVER_PORT ?? '3001'
const requestId = randomUUID()
const ts = Math.floor(Date.now() / 1000)

// Mesmo formato usado pelo WebhookSignatureValidator do SDK do Mercado Pago:
// "id:{data.id};request-id:{x-request-id};ts:{ts};"
const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
const hash = createHmac('sha256', secret).update(manifest).digest('hex')
const signature = `ts=${ts},v1=${hash}`

async function main() {
  const url = `http://localhost:${port}/api/webhook/mercadopago?data.id=${paymentId}&type=payment`

  console.log(`Enviando webhook simulado para ${url}`)
  console.log(`payment_id: ${paymentId}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'x-request-id': requestId,
    },
    body: JSON.stringify({
      action: 'payment.updated',
      api_version: 'v1',
      data: { id: paymentId },
      type: 'payment',
    }),
  })

  console.log(`Status da resposta: ${response.status}`)
  console.log(await response.text())
}

main().catch((error) => {
  console.error('Falha ao enviar webhook de teste:', error)
  process.exit(1)
})
