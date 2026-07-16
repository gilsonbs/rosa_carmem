import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from './logger'

export interface DecrementStockResult {
  success: boolean
  productDisabled: boolean
  error?: string
}

export async function decrementStock(
  productId: string,
  supabase: SupabaseClient,
  units = 1,
): Promise<DecrementStockResult> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchError || !product) {
    return { success: false, productDisabled: false, error: fetchError?.message ?? 'Produto não encontrado' }
  }

  const newStock = Math.max(0, (product as { stock: number }).stock - units)
  const willDisable = newStock === 0

  const { error } = await supabase
    .from('products')
    .update({ stock: newStock, ...(willDisable ? { active: false } : {}) })
    .eq('id', productId)

  if (error) {
    return { success: false, productDisabled: false, error: error.message }
  }

  logger.stockDecremented(productId, units)
  if (willDisable) logger.productDisabled(productId, 'out of stock')

  return { success: true, productDisabled: willDisable }
}

export async function restoreStock(
  productId: string,
  supabase: SupabaseClient,
  units = 1,
): Promise<DecrementStockResult> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (fetchError || !product) {
    return { success: false, productDisabled: false, error: fetchError?.message ?? 'Produto não encontrado' }
  }

  const { error } = await supabase
    .from('products')
    .update({ stock: (product as { stock: number }).stock + units })
    .eq('id', productId)

  if (error) {
    return { success: false, productDisabled: false, error: error.message }
  }

  return { success: true, productDisabled: false }
}
