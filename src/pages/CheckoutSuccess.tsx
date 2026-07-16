import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { formatIsoDate } from '@/utils/format'

interface OrderConfirmation {
  id: string
  order_status: string
  delivery_date: string
  delivery_time: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  product_name: string
}

const POLL_INTERVAL_MS = 1000
const MAX_ATTEMPTS = 5

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const { clearCart } = useCart()

  const [order, setOrder] = useState<OrderConfirmation | null>(null)
  const [loading, setLoading] = useState(Boolean(paymentId))

  useEffect(() => {
    if (!paymentId) {
      setLoading(false)
      return
    }

    let active = true
    let attempts = 0

    async function poll() {
      try {
        const response = await fetch(
          `/api/checkout/order-by-payment?payment_id=${encodeURIComponent(paymentId!)}`,
        )

        if (response.ok) {
          const data = (await response.json()) as OrderConfirmation
          if (active) {
            setOrder(data)
            setLoading(false)
            clearCart()
          }
          return
        }
      } catch {
        // instabilidade de rede — tenta de novo dentro da janela de polling
      }

      attempts += 1
      if (attempts >= MAX_ATTEMPTS) {
        if (active) setLoading(false)
        return
      }

      if (active) {
        setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    poll()

    return () => {
      active = false
    }
  }, [paymentId])

  return (
    <div className="relative min-h-screen bg-fundo overflow-hidden">
      <span className="absolute top-10 left-8 text-5xl opacity-20 select-none" aria-hidden="true">
        🌸
      </span>
      <span className="absolute top-24 right-12 text-4xl opacity-20 select-none" aria-hidden="true">
        🌷
      </span>
      <span className="absolute bottom-16 left-16 text-4xl opacity-20 select-none" aria-hidden="true">
        🌸
      </span>
      <span className="absolute bottom-24 right-20 text-5xl opacity-20 select-none" aria-hidden="true">
        🌺
      </span>

      <div className="relative max-w-lg mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="text-green-500" size={64} strokeWidth={1.5} />
        <h1 className="font-title text-4xl text-texto">Pedido confirmado!</h1>

        {loading ? (
          <div className="flex flex-col items-center gap-2 mt-2">
            <Loader2 className="animate-spin text-rosa" size={28} />
            <p className="text-texto/50 font-body text-sm">
              Confirmando os detalhes do seu pedido...
            </p>
          </div>
        ) : order ? (
          <>
            <p className="text-texto/70 font-body">
              Seu pedido foi confirmado e já está sendo preparado com carinho. 🌸
            </p>
            <div className="mt-2 w-full text-left text-sm font-body text-texto/80 bg-white/60 rounded-xl p-5 flex flex-col gap-2">
              <p>
                <span className="text-texto/50">Pedido:</span>{' '}
                <span className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
              </p>
              <p>
                <span className="text-texto/50">Presente:</span> {order.product_name}
              </p>
              <p>
                <span className="text-texto/50">Entrega agendada:</span>{' '}
                {formatIsoDate(order.delivery_date)} às {order.delivery_time}
              </p>
              <p>
                <span className="text-texto/50">Endereço:</span> {order.street}, {order.number}
                {order.complement ? ` - ${order.complement}` : ''} — {order.neighborhood},{' '}
                {order.city}/{order.state}
              </p>
            </div>
          </>
        ) : (
          <p className="text-texto/70 font-body">
            Em breve entraremos em contato para confirmar os detalhes da entrega.
          </p>
        )}

        <Link to="/">
          <Button className="mt-4">Voltar para a loja</Button>
        </Link>
      </div>
    </div>
  )
}
