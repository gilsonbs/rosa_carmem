import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface StoreStatusValue {
  open: boolean
}

export function useStoreStatus() {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'store_status')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === 'object') {
          setIsOpen((data.value as StoreStatusValue).open ?? true)
        }
        setLoading(false)
      })
  }, [])

  async function setStoreOpen(open: boolean) {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key: 'store_status', value: { open } }, { onConflict: 'key' })
        .select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('Sem permissão')
      setIsOpen(open)
    } finally {
      setSaving(false)
    }
  }

  return { isOpen, loading, saving, setStoreOpen }
}
