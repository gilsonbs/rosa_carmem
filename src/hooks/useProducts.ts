import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('active_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        setError(error.message)
      } else {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()

    // Mantém a vitrine em sincronia sem reload: se um produto for
    // desativado (estoque zerado) enquanto alguém está navegando, ele some
    // da tela na hora. Requer a policy pública de select em "products" e a
    // tabela publicada no supabase_realtime (ver database/realtime.sql).
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const updated = payload.new as Product

          setProducts((prev) => {
            if (!updated.active) {
              return prev.filter((product) => product.id !== updated.id)
            }
            return prev.map((product) => (product.id === updated.id ? updated : product))
          })
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products],
  )

  return { products, featuredProducts, loading, error }
}
