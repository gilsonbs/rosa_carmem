import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BannerSettings {
  enabled: boolean
  messages: [string, string, string]
  /** Versão curta de cada mensagem, exibida no mobile (vazio = usa a mensagem completa). */
  short_messages?: [string, string, string]
  interval: number
}

/**
 * Texto padrão do banner — usado enquanto o cliente não salvar nada na tela
 * "Banner de Anúncio" do admin. Para trocar o padrão, edite aqui.
 */
export const DEFAULT_BANNER_TEXT = '✨ Parcele em até 12x  |  🎁 Personalize seu pedido'
export const DEFAULT_BANNER_TEXT_SHORT = 'Parcele em 12x | Personalize'

export const DEFAULT_BANNER: BannerSettings = {
  enabled: true,
  messages: [DEFAULT_BANNER_TEXT, '', ''],
  short_messages: [DEFAULT_BANNER_TEXT_SHORT, '', ''],
  interval: 4000,
}

function normalize(value: Partial<BannerSettings>): BannerSettings {
  return {
    ...DEFAULT_BANNER,
    ...value,
    short_messages: value.short_messages ?? ['', '', ''],
  }
}

export function useAnnouncementBanner() {
  const [settings, setSettings] = useState<BannerSettings>(DEFAULT_BANNER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'announcement_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(normalize(data.value as Partial<BannerSettings>))
        setLoading(false)
      })
  }, [])

  async function saveSettings(next: BannerSettings) {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key: 'announcement_banner', value: next }, { onConflict: 'key' })
        .select()
      if (error) throw error
      if (!data || data.length === 0) throw new Error('Sem permissão para salvar configurações')
      setSettings(next)
    } finally {
      setSaving(false)
    }
  }

  return { settings, loading, saving, saveSettings }
}
