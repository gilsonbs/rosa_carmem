import { useMemo, useState, type ComponentType } from 'react'
import toast from 'react-hot-toast'
import { DndContext, useDroppable, useDraggable, type DragEndEvent } from '@dnd-kit/core'
import { Inbox, CheckCircle2, Hammer, Truck, Gift, Calendar, Clock, MapPin } from 'lucide-react'
import { useKanban, isKanbanMoveAllowed } from '@/hooks/useKanban'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatIsoDate, getTodayIso, shiftIsoDate } from '@/utils/format'
import { getOrderSourceLabel, getOrderSourceTone } from '@/utils/orderStatus'
import type { OrderStatus, OrderWithRelations } from '@/types'

interface KanbanColumnDef {
  status: OrderStatus
  label: string
  icon: ComponentType<{ size?: number }>
  color: string
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { status: 'new', label: 'Novo', icon: Inbox, color: '#9CA3AF' },
  { status: 'confirmed', label: 'Confirmado', icon: CheckCircle2, color: '#4A90D9' },
  { status: 'preparing', label: 'Em Produção', icon: Hammer, color: '#F5A623' },
  { status: 'out_for_delivery', label: 'Saída p/ Entrega', icon: Truck, color: '#E67E22' },
  { status: 'delivered', label: 'Entregue', icon: Gift, color: '#27AE60' },
]

const COLUMN_LABEL: Record<OrderStatus, string> = Object.fromEntries(
  KANBAN_COLUMNS.map(({ status, label }) => [status, label]),
) as Record<OrderStatus, string>

function deliveryBadge(dateIso: string | null): { label: string; tone: 'danger' | 'dourado' } | null {
  if (!dateIso) return null
  if (dateIso === getTodayIso()) return { label: 'Hoje', tone: 'danger' }
  if (dateIso === shiftIsoDate(getTodayIso(), 1)) return { label: 'Amanhã', tone: 'dourado' }
  return null
}

function Card({ order, color }: { order: OrderWithRelations; color: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, borderLeftColor: color }
    : { borderLeftColor: color }

  const badge = deliveryBadge(order.delivery_date)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-blush/60 border-l-4 px-3 py-2.5 text-sm font-body shadow-sm cursor-grab flex flex-col gap-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-texto/40 text-[11px] font-mono">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
        {badge && (
          <Badge tone={badge.tone} className="text-[10px] px-1.5 py-0.5">
            {badge.label}
          </Badge>
        )}
      </div>
      <Badge tone={getOrderSourceTone(order)} className="text-[10px] px-1.5 py-0.5 w-fit">
        {getOrderSourceLabel(order)}
      </Badge>
      <p className="font-subtitle font-semibold text-texto">{order.customer.name}</p>
      <p className="text-texto/60 text-xs">
        {order.items && order.items.length > 0
          ? order.items.length === 1
            ? `${order.items[0].product.name}${order.items[0].quantity > 1 ? ` ×${order.items[0].quantity}` : ''}`
            : `${order.items.length} produtos`
          : order.product.name}
      </p>
      <p className="text-rosa font-semibold text-xs">{formatCurrency(order.amount)}</p>
      {order.delivery_date && (
        <div className="flex items-center gap-2 text-texto/50 text-[11px] mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {formatIsoDate(order.delivery_date)}
          </span>
          {order.delivery_time && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {order.delivery_time.slice(0, 5)}
            </span>
          )}
        </div>
      )}
      <p className="flex items-center gap-1 text-texto/50 text-[11px]">
        <MapPin size={11} /> {order.city}
      </p>
    </div>
  )
}

function Column({
  def,
  orders,
}: {
  def: KanbanColumnDef
  orders: OrderWithRelations[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: def.status })
  const Icon = def.icon

  return (
    <div className="w-[280px] shrink-0 flex flex-col">
      <div
        className="rounded-t-xl px-3 py-2.5 flex items-center gap-2 text-white"
        style={{ backgroundColor: def.color }}
      >
        <Icon size={16} />
        <h3 className="font-subtitle font-semibold text-sm flex-1">{def.label}</h3>
        <span className="bg-white/25 rounded-full text-xs font-semibold px-2 py-0.5">
          {orders.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-xl p-3 flex flex-col gap-2 min-h-[60vh] transition-colors ${
          isOver ? 'border-2 border-dashed border-rosa bg-blush/20' : 'bg-[#F0EDE8]'
        }`}
      >
        {orders.map((order) => (
          <Card key={order.id} order={order} color={def.color} />
        ))}
      </div>
    </div>
  )
}

export function Kanban() {
  const { orders, loading, error, moveCard } = useKanban()
  const [filterDate, setFilterDate] = useState('')
  const [filterCity, setFilterCity] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesDate = !filterDate || order.delivery_date === filterDate
      const matchesCity =
        !filterCity.trim() || order.city.toLowerCase().includes(filterCity.trim().toLowerCase())
      return matchesDate && matchesCity
    })
  }, [orders, filterDate, filterCity])

  const ordersByStatus = useMemo(() => {
    const grouped = new Map<OrderStatus, OrderWithRelations[]>()
    for (const { status } of KANBAN_COLUMNS) grouped.set(status, [])
    for (const order of filteredOrders) {
      grouped.get(order.order_status)?.push(order)
    }
    return grouped
  }, [filteredOrders])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const orderId = String(active.id)
    const newStatus = over.id as OrderStatus
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    if (!isKanbanMoveAllowed(order.order_status, newStatus)) {
      if (order.order_status !== newStatus) {
        toast.error('Não é possível mover o pedido para essa etapa')
      }
      return
    }

    try {
      const result = await moveCard(orderId, newStatus)
      if (result === 'moved') {
        toast.success(`Pedido movido para ${COLUMN_LABEL[newStatus]}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status')
    }
  }

  const hasFilters = Boolean(filterDate || filterCity)

  return (
    <div>
      <h1 className="text-2xl font-title text-texto mb-6">Kanban de pedidos</h1>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-blush/60 px-3.5 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        <input
          type="text"
          placeholder="Filtrar por cidade..."
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="rounded-lg border border-blush/60 px-3.5 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setFilterDate('')
              setFilterCity('')
            }}
            className="text-sm font-subtitle text-rosa hover:text-rosa/70 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading && <p className="text-texto/60">Carregando pedidos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((def) => (
              <Column key={def.status} def={def} orders={ordersByStatus.get(def.status) ?? []} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  )
}
