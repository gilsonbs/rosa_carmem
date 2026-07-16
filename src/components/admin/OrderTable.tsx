import type { ChangeEvent, MouseEvent } from 'react'
import type { OrderStatus, OrderWithRelations } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatIsoDate } from '@/utils/format'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  getOrderSourceLabel,
  getOrderSourceTone,
} from '@/utils/orderStatus'

interface OrderTableProps {
  orders: OrderWithRelations[]
  onSelectOrder: (order: OrderWithRelations) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export function OrderTable({ orders, onSelectOrder, onStatusChange }: OrderTableProps) {
  function handleStatusClick(e: MouseEvent) {
    e.stopPropagation()
  }

  function handleStatusChange(e: ChangeEvent<HTMLSelectElement>, orderId: string) {
    onStatusChange(orderId, e.target.value as OrderStatus)
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-blush/60 bg-white p-10 text-center text-texto/50 font-body">
        Nenhum pedido encontrado.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-blush/60 bg-white">
      <table className="w-full text-sm font-body">
        <thead className="bg-blush/20 text-texto/70 font-subtitle">
          <tr>
            <th className="text-left px-4 py-3">Cliente</th>
            <th className="text-left px-4 py-3">Produto</th>
            <th className="text-left px-4 py-3">Valor</th>
            <th className="text-left px-4 py-3">Pagamento</th>
            <th className="text-left px-4 py-3">Origem</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Entrega</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="border-t border-blush/40 hover:bg-blush/10 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <p className="text-texto">{order.customer.name}</p>
                <p className="text-texto/50 text-xs">{order.customer.email}</p>
              </td>
              <td className="px-4 py-3">
                {order.items && order.items.length > 0 ? (
                  order.items.length === 1
                    ? `${order.items[0].product.name}${order.items[0].quantity > 1 ? ` ×${order.items[0].quantity}` : ''}`
                    : `${order.items.length} produtos`
                ) : (
                  order.product.name
                )}
              </td>
              <td className="px-4 py-3">{formatCurrency(order.amount)}</td>
              <td className="px-4 py-3">
                <Badge tone={PAYMENT_STATUS_TONE[order.payment_status]}>
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={getOrderSourceTone(order)}>{getOrderSourceLabel(order)}</Badge>
              </td>
              <td className="px-4 py-3" onClick={handleStatusClick}>
                <select
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(e, order.id)}
                  className="rounded-full border border-blush/60 bg-white px-2.5 py-1 text-xs font-subtitle text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40"
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-texto/70">
                {order.delivery_date ? (
                  <>
                    {formatIsoDate(order.delivery_date)}
                    {order.delivery_time ? ` às ${order.delivery_time.slice(0, 5)}` : ''}
                  </>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
