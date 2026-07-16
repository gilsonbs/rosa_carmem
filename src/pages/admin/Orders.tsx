import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { useOrders, type ManualOrderInput } from '@/hooks/useOrders'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { OrderTable } from '@/components/admin/OrderTable'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'
import { ManualOrderForm } from '@/components/admin/ManualOrderForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '@/utils/orderStatus'
import type { OrderStatus, OrderWithRelations } from '@/types'

const STATUS_FILTER_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  ...ORDER_STATUS_OPTIONS.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] })),
]

export function Orders() {
  const { orders, loading, error, updateOrderStatus, createManualOrder } = useOrders()
  const { products } = useAdminProducts()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null)
  const [newOrderOpen, setNewOrderOpen] = useState(false)

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter
      const matchesSearch =
        !term ||
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, search])

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Status atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status')
    }
  }

  async function handleCreateManualOrder(input: ManualOrderInput) {
    try {
      await createManualOrder(input)
      toast.success('Pedido criado com sucesso!')
      setNewOrderOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar pedido')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-title text-texto">Pedidos</h1>
        <Button onClick={() => setNewOrderOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Novo Pedido
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-blush/60 px-3.5 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="rounded-lg border border-blush/60 px-3.5 py-2 text-sm font-subtitle text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-texto/60">Carregando pedidos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <OrderTable
          orders={filteredOrders}
          onSelectOrder={setSelectedOrder}
          onStatusChange={handleStatusChange}
        />
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Modal open={newOrderOpen} onClose={() => setNewOrderOpen(false)} title="Novo Pedido">
        <ManualOrderForm
          products={products}
          onSubmit={handleCreateManualOrder}
          onCancel={() => setNewOrderOpen(false)}
        />
      </Modal>
    </div>
  )
}
