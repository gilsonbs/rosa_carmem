import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { OrderStatus, OrderWithRelations } from '@/types'

export const KANBAN_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
]

const STATUS_RANK: Record<OrderStatus, number> = {
  new: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
}

export function isKanbanMoveAllowed(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  // Única regressão permitida: voltar de "Em Produção" para "Confirmado".
  if (from === 'preparing' && to === 'confirmed') return true
  return STATUS_RANK[to] > STATUS_RANK[from]
}

export function useKanban() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customers(*), product:products(*)')
      .in('order_status', KANBAN_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setOrders(data as unknown as OrderWithRelations[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const channel = supabase
      .channel('kanban-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as { id: string; order_status: OrderStatus }
          setOrders((prev) => {
            if (!KANBAN_STATUSES.includes(updated.order_status)) {
              return prev.filter((order) => order.id !== updated.id)
            }
            if (prev.some((order) => order.id === updated.id)) {
              return prev.map((order) =>
                order.id === updated.id ? { ...order, order_status: updated.order_status } : order,
              )
            }
            // Pedido não estava carregado (ex: acabou de sair de "cancelled")
            return prev
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const created = payload.new as { id: string }
          const { data } = await supabase
            .from('orders')
            .select('*, customer:customers(*), product:products(*)')
            .eq('id', created.id)
            .single()

          if (data) {
            setOrders((prev) =>
              prev.some((order) => order.id === data.id) ? prev : [data as OrderWithRelations, ...prev],
            )
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          const deleted = payload.old as { id: string }
          setOrders((prev) => prev.filter((order) => order.id !== deleted.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function moveCard(orderId: string, newStatus: OrderStatus): Promise<'moved' | 'blocked'> {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return 'blocked'
    if (!isKanbanMoveAllowed(order.order_status, newStatus)) return 'blocked'

    const previousStatus = order.order_status
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)),
    )

    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId)

    if (updateError) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: previousStatus } : o)),
      )
      throw new Error(updateError.message)
    }

    return 'moved'
  }

  return { orders, loading, error, moveCard }
}
