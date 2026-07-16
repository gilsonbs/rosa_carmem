import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface NewOrderJoin {
  customer: { name: string } | null
  product: { name: string } | null
}

export function useNewOrderAlerts() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const channel = supabase
      .channel('new-order-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const created = payload.new as { id: string }
          setCount((prev) => prev + 1)

          const { data } = await supabase
            .from('orders')
            .select('customer:customers(name), product:products(name)')
            .eq('id', created.id)
            .single()

          const join = data as unknown as NewOrderJoin | null
          const customerName = join?.customer?.name ?? 'Cliente'
          const productName = join?.product?.name ?? 'produto'
          toast(`🛒 Novo pedido! ${customerName} — ${productName}`)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function resetCount() {
    setCount(0)
  }

  return { count, resetCount }
}
