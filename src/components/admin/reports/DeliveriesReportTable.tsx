import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '@/utils/orderStatus'
import { formatIsoDate } from '@/utils/format'
import { formatAddress } from '@/utils/address'
import type { OrderWithRelations } from '@/types'

const PAGE_SIZE = 15

type DeliveryStatusFilter = 'all' | 'pending' | 'completed'

const FILTER_OPTIONS: { value: DeliveryStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluída' },
]

export function DeliveriesReportTable({ orders }: { orders: OrderWithRelations[] }) {
  const [statusFilter, setStatusFilter] = useState<DeliveryStatusFilter>('all')
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const dateCompare = (a.delivery_date ?? '').localeCompare(b.delivery_date ?? '')
        if (dateCompare !== 0) return dateCompare
        return (a.delivery_time ?? '').localeCompare(b.delivery_time ?? '')
      }),
    [orders],
  )

  const filtered = useMemo(() => {
    return sorted.filter((order) => {
      if (statusFilter === 'completed') return order.order_status === 'delivered'
      if (statusFilter === 'pending') {
        return order.order_status !== 'delivered' && order.order_status !== 'cancelled'
      }
      return true
    })
  }, [sorted, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange(value: DeliveryStatusFilter) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-subtitle font-semibold text-texto">Entregas agendadas no período</h2>
        <div className="flex gap-1 print:hidden">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleFilterChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-subtitle font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-rosa text-white'
                  : 'bg-blush/20 text-texto/70 hover:bg-blush/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-texto/50 text-sm font-body">Nenhuma entrega agendada no período.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-texto/50 border-b border-blush/40">
                  <th className="py-2 pr-3 font-subtitle font-medium">Data</th>
                  <th className="py-2 pr-3 font-subtitle font-medium">Horário</th>
                  <th className="py-2 pr-3 font-subtitle font-medium">Cliente</th>
                  <th className="py-2 pr-3 font-subtitle font-medium">Produto</th>
                  <th className="py-2 pr-3 font-subtitle font-medium">Endereço</th>
                  <th className="py-2 pr-3 font-subtitle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => (
                  <tr key={order.id} className="border-b border-blush/20 last:border-0">
                    <td className="py-2 pr-3 text-texto">
                      {order.delivery_date ? formatIsoDate(order.delivery_date) : '—'}
                    </td>
                    <td className="py-2 pr-3 text-texto">{order.delivery_time?.slice(0, 5) ?? '—'}</td>
                    <td className="py-2 pr-3 text-texto">{order.customer.name}</td>
                    <td className="py-2 pr-3 text-texto/70">{order.product.name}</td>
                    <td className="py-2 pr-3 text-texto/70">{formatAddress(order)}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={ORDER_STATUS_TONE[order.order_status]}>
                        {ORDER_STATUS_LABELS[order.order_status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 print:hidden">
              <span className="text-xs text-texto/50 font-body">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-blush/60 text-sm disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-blush/60 text-sm disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
