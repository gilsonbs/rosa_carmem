import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

// Alias mantido para compatibilidade com páginas que importam ProductWithStock
export type ProductWithStock = Product

export interface ProductInput {
  name: string
  description: string | null
  price: number
  image_url: string | null
  featured: boolean
  active: boolean
  category: string | null
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setProducts((data as Product[]) ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function createProduct(input: ProductInput) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, stock: 1 })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    setProducts((prev) => [data as Product, ...prev])
  }

  async function updateProduct(id: string, input: ProductInput) {
    // Omit category from payload when null — avoids "column not in schema cache"
    // error on databases where migration_category.sql hasn't been run yet.
    const { category, ...base } = input
    const payload = category !== null ? { ...base, category } : base
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)))
  }

  async function updateStock(id: string, stock: number) {
    const newStock = Math.max(0, stock)
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock, ...(newStock > 0 ? { active: true } : {}) })
      .eq('id', id)
    if (error) throw new Error(error.message)
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock, ...(newStock > 0 ? { active: true } : {}) } : p)),
    )
  }

  async function deleteProduct(id: string): Promise<'deleted' | 'deactivated'> {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      if (error.code === '23503') {
        const { error: updateError } = await supabase
          .from('products')
          .update({ active: false })
          .eq('id', id)
        if (updateError) throw new Error(updateError.message)
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)))
        return 'deactivated'
      }
      throw new Error(error.message)
    }

    setProducts((prev) => prev.filter((p) => p.id !== id))
    return 'deleted'
  }

  async function toggleProductField(id: string, field: 'featured' | 'active', value: boolean) {
    const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id)
    if (error) throw new Error(error.message)
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  async function uploadProductImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    toggleProductField,
    uploadProductImage,
    refetch: fetchProducts,
  }
}
