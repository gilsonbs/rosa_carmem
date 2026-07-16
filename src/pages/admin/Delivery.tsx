import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '@/utils/orderStatus'
import { getTodayIso, shiftIsoDate, formatIsoDate } from '@/utils/format'
import { formatAddress, googleMapsSearchUrl } from '@/utils/address'
import type { OrderStatus, OrderWithRelations } from '@/types'

const ACTIONABLE_STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery']

function nextDeliveryAction(status: OrderStatus): { label: string; next: OrderStatus } | null {
  if (status === 'confirmed' || status === 'preparing') {
    return { label: 'Saiu para entrega', next: 'out_for_delivery' }
  }
  if (status === 'out_for_delivery') {
    return { label: 'Marcar como entregue', next: 'delivered' }
  }
  return null
}

function buildWhatsAppMessage(orders: OrderWithRelations[], dateIso: string): string {
  const lines = [
    '🌸 *Rosa Carmen — Rota de Entregas*',
    `📅 Data: ${formatIsoDate(dateIso)}`,
    '',
  ]

  orders.forEach((order, index) => {
    lines.push(`*${index + 1}º Entrega — ${order.delivery_time?.slice(0, 5) ?? '--:--'}*`)
    lines.push(`👤 ${order.customer.name}`)
    lines.push(`📍 ${formatAddress(order)}`)
    lines.push(`📱 ${order.customer.phone}`)
    const productSummary =
      order.items && order.items.length > 0
        ? order.items.map((i) => `${i.product.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')
        : order.product.name
    lines.push(`🎁 ${productSummary}`)
    lines.push('')
  })

  lines.push('Boa entrega! 🚗💨')
  return lines.join('\n')
}

function buildMapsRouteUrl(orders: OrderWithRelations[]): string {
  const addresses = orders.map((order) => encodeURIComponent(formatAddress(order, true)))
  const origin = addresses[0]
  const destination = addresses[addresses.length - 1]
  const waypoints = addresses.slice(1, -1).join('|')
  return waypoints
    ? `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}`
    : `https://www.google.com/maps/dir/${origin}/${destination}`
}

export function Delivery() {
  const { orders, loading, error, updateOrderStatus } = useOrders()
  const [selectedDate, setSelectedDate] = useState(getTodayIso())

  const dayOrders = useMemo(() => {
    // Baseado só em order_status (o que o admin de fato controla), não em
    // payment_status: um pedido pode ter o status avançado manualmente
    // (Pedidos/Kanban) antes do Mercado Pago confirmar o pagamento, e ainda
    // assim precisa aparecer aqui. "new" fica de fora porque normalmente
    // significa checkout iniciado sem confirmação nenhuma ainda.
    return orders
      .filter(
        (order) =>
          order.delivery_date === selectedDate &&
          order.order_status !== 'new' &&
          order.order_status !== 'cancelled',
      )
      .sort((a, b) => (a.delivery_time ?? '').localeCompare(b.delivery_time ?? ''))
  }, [orders, selectedDate])

  const deliveries = useMemo(
    () => dayOrders.filter((order) => ACTIONABLE_STATUSES.includes(order.order_status)),
    [dayOrders],
  )

  const summary = useMemo(() => {
    const total = dayOrders.length
    const completed = dayOrders.filter((order) => order.order_status === 'delivered').length
    return { total, completed, pending: total - completed }
  }, [dayOrders])

  async function handleAdvanceStatus(order: OrderWithRelations) {
    const action = nextDeliveryAction(order.order_status)
    if (!action) return

    try {
      await updateOrderStatus(order.id, action.next)
      toast.success('Status atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status')
    }
  }

  function handleShareWhatsApp() {
    const text = buildWhatsAppMessage(deliveries, selectedDate)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function handleOpenMapsRoute() {
    window.open(buildMapsRouteUrl(deliveries), '_blank')
  }

  return (
    <div>
      <h1 className="text-2xl font-title text-texto mb-6">Entregas</h1>

      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => setSelectedDate((d) => shiftIsoDate(d, -1))}
          className="text-texto/50 hover:text-texto transition-colors"
          aria-label="Dia anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-blush/60 px-3.5 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        <button
          type="button"
          onClick={() => setSelectedDate((d) => shiftIsoDate(d, 1))}
          className="text-texto/50 hover:text-texto transition-colors"
          aria-label="Próximo dia"
        >
          <ChevronRight size={20} />
        </button>
        {selectedDate !== getTodayIso() && (
          <button
            type="button"
            onClick={() => setSelectedDate(getTodayIso())}
            className="text-sm font-subtitle text-rosa hover:text-rosa/70 transition-colors"
          >
            Hoje
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div className="flex gap-3 text-sm font-body text-texto/70">
          <span>
            <strong className="font-subtitle font-semibold text-texto">{summary.total}</strong> no dia
          </span>
          <span>
            <strong className="font-subtitle font-semibold text-texto">{summary.pending}</strong> pendentes
          </span>
          <span>
            <strong className="font-subtitle font-semibold text-texto">{summary.completed}</strong> concluídas
          </span>
        </div>

        <div className="flex gap-2 ml-auto">
          {deliveries.length > 0 && (
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-subtitle font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              📍 Compartilhar rota com entregador
            </button>
          )}
          {deliveries.length >= 2 && (
            <button
              type="button"
              onClick={handleOpenMapsRoute}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-subtitle font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#4285F4' }}
            >
              🗺️ Ver rota no Google Maps
            </button>
          )}
        </div>
      </div>

      {loading && <p className="text-texto/60">Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && deliveries.length === 0 && (
        <p className="text-texto/60 font-body">Nenhuma entrega agendada para esse dia.</p>
      )}

      {!loading && !error && deliveries.length > 0 && (
        <div className="flex flex-col gap-3">
          {deliveries.map((order, index) => {
            const action = nextDeliveryAction(order.order_status)
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-blush/60 p-4 flex items-center gap-4"
              >
                <div className="text-center shrink-0 w-16">
                  <p className="text-texto/40 text-xs font-subtitle">{index + 1}º</p>
                  <p className="font-subtitle font-semibold text-rosa text-lg">
                    {order.delivery_time?.slice(0, 5) ?? '—'}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-subtitle font-semibold text-texto">{order.customer.name}</p>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-texto/60 text-sm flex items-center gap-1 hover:text-rosa transition-colors w-fit"
                  >
                    <Phone size={12} /> {order.customer.phone}
                  </a>
                  <p className="text-texto/70 text-sm mt-1">{formatAddress(order, true)}</p>
                  <a
                    href={googleMapsSearchUrl(order)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rosa text-xs flex items-center gap-1 mt-1 hover:text-rosa/70 transition-colors w-fit"
                  >
                    <MapPin size={12} /> Ver no mapa
                  </a>
                  <p className="text-texto/50 text-xs mt-1">
                    {order.items && order.items.length > 0
                      ? order.items.map((i) => `${i.product.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')
                      : order.product.name}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge tone={ORDER_STATUS_TONE[order.order_status]}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </Badge>
                  {action && (
                    <Button size="sm" variant="outline" onClick={() => handleAdvanceStatus(order)}>
                      {action.label}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
