import { useState } from 'react'
import type { ComponentProps } from 'react'
import { initMercadoPago, CardPayment, Payment } from '@mercadopago/sdk-react'
import { MERCADOPAGO_PUBLIC_KEY } from '@/lib/mercadopago'

const frontendUrl = window.location.origin

let mpInitialized = false
function ensureInit() {
  if (!mpInitialized) {
    initMercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' })
    mpInitialized = true
  }
}

type Tab = 'card' | 'pix'
type CardParam = Parameters<ComponentProps<typeof CardPayment>['onSubmit']>[0]
type PixParam = Parameters<ComponentProps<typeof Payment>['onSubmit']>[0]

interface Props {
  orderId: string
  amount: number
}

async function processPayment(orderId: string, formData: Record<string, unknown>) {
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
  }
  // pending (Pix) — brick exibe QR automaticamente
}

export function PaymentBrick({ orderId, amount }: Props) {
  ensureInit()
  const [tab, setTab] = useState<Tab>('card')

  async function handleCard(param: CardParam) {
    await processPayment(orderId, param as unknown as Record<string, unknown>)
  }

  async function handlePix(param: PixParam) {
    await processPayment(orderId, param.formData as unknown as Record<string, unknown>)
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-blush/40">
        {(
          [
            { id: 'card', label: 'Cartão de crédito/débito' },
            { id: 'pix', label: 'Pix' },
          ] as { id: Tab; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`pb-3 px-3 font-subtitle text-sm transition-colors border-b-2 ${
              tab === id
                ? 'border-rosa text-rosa'
                : 'border-transparent text-texto/50 hover:text-texto'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'card' && (
        <CardPayment
          initialization={{ amount }}
          customization={{ paymentMethods: { minInstallments: 1, maxInstallments: 12 } }}
          onSubmit={handleCard}
          onError={(error) => console.error('MP CardPayment error:', error)}
        />
      )}

      {tab === 'pix' && (
        <Payment
          initialization={{ amount }}
          customization={{ paymentMethods: { bankTransfer: 'all' } }}
          onSubmit={handlePix}
          onError={(error) => console.error('MP Pix error:', error)}
        />
      )}
    </div>
  )
}
