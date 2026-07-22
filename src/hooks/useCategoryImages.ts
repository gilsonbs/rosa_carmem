import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type CategoryImages = Record<string, string>

export function useCategoryImages() {
  const [images, setImages] = useState<CategoryImages>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchImages = useCallback(async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'category_images')
      .maybeSingle()
    setImages((data?.value as CategoryImages) ?? {})
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  async function saveImages(next: CategoryImages) {
    setSaving(true)
    await supabase
      .from('settings')
      .upsert({ key: 'category_images', value: next })
    setImages(next)
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

  return { images, loading, saving, saveImages, uploadCategoryImage }
}
