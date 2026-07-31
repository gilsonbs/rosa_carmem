import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import { MERCADOPAGO_PUBLIC_KEY } from '@/lib/mercadopago'

const frontendUrl = window.location.origin

let mpInitialized = false
function ensureInit() {
  if (!mpInitialized) {
    initMercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
    mpInitialized = true
  }
}

interface Props {
  preferenceId: string
  orderId: string
  amount: number
}

export function PaymentBrick({ preferenceId, orderId, amount }: Props) {
  ensureInit()

  async function handleSubmit({
    formData,
  }: {
    selectedPaymentMethod: string
    formData: Record<string, unknown>
  }) {
    const response = await fetch('/api/checkout/process-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, form_data: formData }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error ?? 'Erro ao processar pagamento')
    }

    const result = (await response.json()) as { status: string; payment_id: number }

    if (result.status === 'approved') {
      window.location.href = `${frontendUrl}/checkout/success?payment_id=${result.payment_id}`
    } else if (result.status === 'rejected') {
      throw new Error('Pagamento recusado. Verifique os dados do cartão e tente novamente.')
    } else {
      // pending (Pix, boleto) — brick exibe QR/boleto automaticamente
    }
  }

  return (
    <div className="mt-2">
      <Payment
        initialization={{ amount, preferenceId }}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',
            bankTransfer: 'all',
            mercadoPago: 'none',
          },
        }}
        onSubmit={handleSubmit}
        onError={(error) => {
          console.error('Mercado Pago Brick error:', error)
        }}
      />
    </div>
  )
}
