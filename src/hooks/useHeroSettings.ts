import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export interface HeroSettings {
  product_ids: string[]
  auto_advance: boolean
  interval_seconds: number
  show_price: boolean
}

const DEFAULT_SETTINGS: HeroSettings = {
  product_ids: [],
  auto_advance: true,
  interval_seconds: 5,
  show_price: false,
}

export function useHeroSettings() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS)
  const [heroProducts, setHeroProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'hero')
      .maybeSingle()
      .then(({ data }) => {
        const s = data?.value ? (data.value as HeroSettings) : DEFAULT_SETTINGS
        setSettings(s)

        // Busca os produtos do hero diretamente por ID (sem filtro de estoque/active)
        if (s.product_ids.length > 0) {
          supabase
            .from('products')
            .select('*')
            .in('id', s.product_ids)
            .then(({ data: prods }) => {
              if (prods) {
                // Mantém a ordem definida pelo admin
                const ordered = s.product_ids
                  .map((id) => prods.find((p) => p.id === id))
                  .filter(Boolean) as Product[]
                setHeroProducts(ordered)
              }
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      })
  }, [])

  async function saveSettings(next: HeroSettings) {
    setSaving(true)
    await supabase
      .from('settings')
      .upsert({ key: 'hero', value: next })
    setSettings(next)
    setSaving(false)
  }

  return { settings, heroProducts, loading, saving, saveSettings }
}
