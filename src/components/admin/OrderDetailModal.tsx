import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, formatIsoDate } from '@/utils/format'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from '@/utils/orderStatus'
import type { OrderStatusHistory, OrderWithRelations } from '@/types'

interface OrderDetailModalProps {
  order: OrderWithRelations | null
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!order) {
      setHistory([])
      return
    }

    let active = true
    setLoadingHistory(true)

    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('changed_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (!error) setHistory((data ?? []) as OrderStatusHistory[])
        setLoadingHistory(false)
      })

    return () => {
      active = false
    }
  }, [order])

  return (
    <Modal
      open={Boolean(order)}
      onClose={onClose}
      title={order ? `Pedido #${order.id.slice(0, 8).toUpperCase()}` : undefined}
    >
      {order && (
        <div className="flex flex-col gap-5 text-sm font-body">
          <div className="flex items-center gap-2">
            <Badge tone={PAYMENT_STATUS_TONE[order.payment_status]}>
              {PAYMENT_STATUS_LABELS[order.payment_status]}
            </Badge>
            <Badge tone={ORDER_STATUS_TONE[order.order_status]}>
              {ORDER_STATUS_LABELS[order.order_status]}
            </Badge>
          </div>

          <section>
            <h4 className="font-subtitle font-semibold text-texto mb-1">Cliente</h4>
            <p className="text-texto/80">{order.customer.name}</p>
            <p className="text-texto/60">
              {order.customer.email} · {order.customer.phone}
            </p>
          </section>

          <section>
            <h4 className="font-subtitle font-semibold text-texto mb-1">Produtos</h4>
            {order.items && order.items.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-texto/80">
                    <span>
                      {item.product.name}
                      {item.quantity > 1 && <span className="text-texto/50"> ×{item.quantity}</span>}
                    </span>
                    <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between font-subtitle font-semibold text-texto border-t border-blush/40 pt-1 mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(order.amount)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-texto/80">
                {order.product.name} — {formatCurrency(order.amount)}
              </p>
            )}
          </section>

          <section>
            <h4 className="font-subtitle font-semibold text-texto mb-1">Entrega</h4>
            <p className="text-texto/80">
              {order.street}, {order.number}
              {order.complement ? ` - ${order.complement}` : ''} — {order.neighborhood},{' '}
              {order.city}/{order.state} — CEP {order.zip_code}
            </p>
            {order.delivery_date && (
              <p className="text-texto/60">
                {formatIsoDate(order.delivery_date)}
                {order.delivery_time ? ` às ${order.delivery_time.slice(0, 5)}` : ''}
              </p>
            )}
          </section>

          <section>
            <h4 className="font-subtitle font-semibold text-texto mb-1">Mercado Pago</h4>
            <p className="text-texto/60">Preferência: {order.mercadopago_preference_id ?? '—'}</p>
            <p className="text-texto/60">Pagamento: {order.mercadopago_payment_id ?? '—'}</p>
          </section>

          <section>
            <h4 className="font-subtitle font-semibold text-texto mb-1">Histórico de status</h4>
            {loadingHistory ? (
              <p className="text-texto/50">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="text-texto/50">Sem histórico registrado.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {history.map((entry) => (
                  <li key={entry.id} className="flex justify-between text-texto/70">
                    <span>{ORDER_STATUS_LABELS[entry.status]}</span>
                    <span className="text-texto/40">
                      {formatDate(entry.changed_at, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  )
}
