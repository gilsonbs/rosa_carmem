import { supabase } from '@/lib/supabase'

export async function decrementStock(productId: string, units = 1): Promise<void> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchError || !product) throw new Error(fetchError?.message ?? 'Produto não encontrado')

  const newStock = Math.max(0, product.stock - units)
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock, ...(newStock === 0 ? { active: false } : {}) })
    .eq('id', productId)

  if (error) throw new Error(error.message)
}

export async function restoreStock(productId: string, units = 1): Promise<void> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchError || !product) throw new Error(fetchError?.message ?? 'Produto não encontrado')

  const { error } = await supabase
    .from('products')
    .update({ stock: product.stock + units })
    .eq('id', productId)

  if (error) throw new Error(error.message)
}
