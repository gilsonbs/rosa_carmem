import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

/** Item editável na tela de categorias do admin (id ausente = nova). */
export interface CategoryDraft {
  id?: string
  name: string
  slug: string
  image_url: string | null
}

export function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Categorias da tabela `categories` (database/categories.sql), na ordem de exibição. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    if (!error) setCategories((data ?? []) as Category[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  /**
   * Salva a lista inteira editada no admin: atualiza as existentes (nome,
   * foto, ordem), cria as novas e remove as que saíram da lista. Os vínculos
   * em product_categories das removidas caem via ON DELETE CASCADE.
   */
  async function saveAll(drafts: CategoryDraft[]) {
    setSaving(true)
    try {
      const keepIds = new Set(drafts.filter((d) => d.id).map((d) => d.id!))
      const removed = categories.filter((c) => !keepIds.has(c.id))

      if (removed.length > 0) {
        const { error } = await supabase
          .from('categories')
          .delete()
          .in('id', removed.map((c) => c.id))
        if (error) throw new Error(error.message)
      }

      for (const [index, d] of drafts.entries()) {
        const row = { name: d.name.trim(), image_url: d.image_url, display_order: index + 1 }
        if (d.id) {
          const { data, error } = await supabase.from('categories').update(row).eq('id', d.id).select('id')
          if (error) throw new Error(error.message)
          if (!data || data.length === 0) throw new Error('Sem permissão para salvar categorias')
        } else {
          const { error } = await supabase.from('categories').insert({ ...row, slug: d.slug })
          if (error) {
            throw new Error(
              error.code === '23505' ? `Já existe uma categoria com o endereço "${d.slug}"` : error.message,
            )
          }
        }
      }

      await fetchCategories()
    } finally {
      setSaving(false)
    }
  }

  async function uploadCategoryImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `categories/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }

  return { categories, loading, saving, saveAll, uploadCategoryImage, refetch: fetchCategories }
}
