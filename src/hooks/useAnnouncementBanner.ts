import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BannerSettings {
  enabled: boolean
  messages: [string, string, string]
  interval: number
}

const DEFAULT: BannerSettings = {
  enabled: false,
  messages: ['', '', ''],
  interval: 4000,
}

export function useAnnouncementBanner() {
  const [settings, setSettings] = useState<BannerSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'announcement_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(data.value as BannerSettings)
        setLoading(false)
      })
  }, [])

  async function saveSettings(next: BannerSettings) {
    setSaving(true)
    await supabase
      .from('settings')
      .upsert({ key: 'announcement_banner', value: next })
    setSettings(next)
    setSaving(false)
  }

  return { settings, loading, saving, saveSettings }
}
