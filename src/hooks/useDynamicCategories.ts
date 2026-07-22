import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/utils/categories'

export interface DynamicCategory {
  value: string
  label: string
  image?: string
}

const DEFAULTS: DynamicCategory[] = CATEGORIES.map((c) => ({ value: c.value, label: c.label }))

export function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function useDynamicCategories() {
  const [categories, setCategories] = useState<DynamicCategory[]>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'categories')
      .maybeSingle()
    if (data?.value && Array.isArray(data.value) && (data.value as DynamicCategory[]).length > 0) {
      setCategories(data.value as DynamicCategory[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function saveCategories(cats: DynamicCategory[]) {
    setSaving(true)
    await supabase.from('settings').upsert({ key: 'categories', value: cats })
    setCategories(cats)
    setSaving(false)
  }

  async function uploadCategoryImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `categories/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }

  function getCategoryLabel(value: string): string {
    return categories.find((c) => c.value === value)?.label ?? value
  }

  return { categories, loading, saving, saveCategories, uploadCategoryImage, getCategoryLabel }
}
