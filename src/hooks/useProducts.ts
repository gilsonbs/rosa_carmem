import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

type ProductRow = Product & { product_categories?: Array<{ category_id: string }> | null }

/** Converte o join `product_categories(category_id)` em `category_ids`. */
export function withCategoryIds(rows: ProductRow[]): Product[] {
  return rows.map(({ product_categories, ...p }) => ({
    ...p,
    category_ids: (product_categories ?? []).map((pc) => pc.category_id),
  }))
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(category_id)')
        .eq('active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        setError(error.message)
      } else {
        setProducts(withCategoryIds(data as ProductRow[]))
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
            // O payload do Realtime não traz o join de categorias — preserva o que já temos.
            return prev.map((product) =>
              product.id === updated.id
                ? { ...updated, category_ids: product.category_ids ?? [] }
                : product,
            )
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
