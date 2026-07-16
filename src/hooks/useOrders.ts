import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { decrementStock, restoreStock } from '@/utils/stock'
import type { OrderItem, OrderStatus, OrderWithRelations } from '@/types'

export interface ManualOrderItemInput {
  product_id: string
  quantity: number
  unit_price: number
}

export interface ManualOrderInput {
  customer: {
    name: string
    email: string
    phone: string
  }
  items: ManualOrderItemInput[]
  amount: number
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
  }
  delivery_date: string
  delivery_time: string
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)

    // Tenta buscar com order_items (requer migration_order_items.sql).
    // Se a tabela ainda não existir, faz fallback sem o join.
    const { data, error: joinError } = await supabase
      .from('orders')
      .select('*, customer:customers(*), product:products(*), items:order_items(*, product:products(*))')
      .order('created_at', { ascending: false })

    if (!joinError) {
      setOrders(data as unknown as OrderWithRelations[])
      setError(null)
      setLoading(false)
      return
    }

    const { data: plainData, error: plainError } = await supabase
      .from('orders')
      .select('*, customer:customers(*), product:products(*)')
      .order('created_at', { ascending: false })

    if (plainError) {
      setError(plainError.message)
    } else {
      setOrders(
        (plainData as unknown as OrderWithRelations[]).map((o) => ({ ...o, items: [] })),
      )
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = orders.find((o) => o.id === orderId)

    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    if (order && order.payment_status === 'approved') {
      const isCancelling = status === 'cancelled' && order.order_status !== 'cancelled'
      const isUncancelling = order.order_status === 'cancelled' && status !== 'cancelled'

      if (isCancelling || isUncancelling) {
        const itemsToProcess: { product_id: string; quantity: number }[] =
          order.items && order.items.length > 0
            ? order.items.map((i: OrderItem) => ({ product_id: i.product_id, quantity: i.quantity }))
            : [{ product_id: order.product_id, quantity: 1 }]

        for (const item of itemsToProcess) {
          if (isCancelling) {
            await restoreStock(item.product_id, item.quantity)
          } else {
            await decrementStock(item.product_id, item.quantity)
          }
        }
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o)),
    )
  }

  async function upsertCustomer(customer: ManualOrderInput['customer']): Promise<string> {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('customers')
        .update({ name: customer.name, phone: customer.phone })
        .eq('id', existing.id)

      if (error) throw new Error(error.message)
      return existing.id
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({ name: customer.name, email: customer.email, phone: customer.phone })
      .select('id')
      .single()

    if (error || !data) throw new Error(error?.message ?? 'Erro ao salvar cliente')
    return data.id
  }

  async function createManualOrder(input: ManualOrderInput) {
    const customerId = await upsertCustomer(input.customer)
    const firstItem = input.items[0]

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        product_id: firstItem.product_id,
        amount: input.amount,
        payment_status: 'approved',
        order_status: 'confirmed',
        street: input.address.street,
        number: input.address.number,
        complement: input.address.complement || null,
        neighborhood: input.address.neighborhood,
        city: input.address.city,
        state: input.address.state,
        zip_code: input.address.zip_code,
        delivery_date: input.delivery_date,
        delivery_time: input.delivery_time,
      })
      .select('id')
      .single()

    if (orderError || !order) throw new Error(orderError?.message ?? 'Erro ao criar pedido')

    // Insere order_items se a tabela existir (requer migration_order_items.sql)
    const { error: itemsError } = await supabase.from('order_items').insert(
      input.items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    )

    // Ignora erro "tabela não encontrada" (migração pendente) — o pedido já foi criado
    if (itemsError && !itemsError.message.includes('does not exist') && !itemsError.message.includes('relation')) {
      throw new Error(itemsError.message)
    }

    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({ order_id: order.id, status: 'confirmed' })

    if (historyError) throw new Error(historyError.message)

    for (const item of input.items) {
      await decrementStock(item.product_id, item.quantity)
    }

    await fetchOrders()
  }

  return { orders, loading, error, updateOrderStatus, createManualOrder, refetch: fetchOrders }
}
