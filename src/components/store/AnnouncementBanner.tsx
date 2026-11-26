import { useState, useEffect, useMemo } from 'react'
import { useAnnouncementBanner } from '@/hooks/useAnnouncementBanner'

/**
 * Faixa fina acima do header. O texto vem da tela "Banner de Anúncio" do
 * admin; enquanto nada for salvo lá, usa DEFAULT_BANNER_TEXT
 * (src/hooks/useAnnouncementBanner.ts).
 */
export function AnnouncementBanner() {
  const { settings, loading } = useAnnouncementBanner()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const active = useMemo(
    () =>
      settings.messages
        .map((full, i) => ({ full: full.trim(), short: settings.short_messages?.[i]?.trim() ?? '' }))
        .filter((m) => m.full !== ''),
    [settings.messages, settings.short_messages],
  )

  useEffect(() => {
    if (active.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % active.length)
        setVisible(true)
      }, 400)
    }, settings.interval)
    return () => clearInterval(timer)
  }, [active.length, settings.interval])

  if (loading || !settings.enabled || active.length === 0) return null

  const current = active[index % active.length]

  return (
    <div className="w-full h-9 bg-rosa text-white px-4 flex items-center justify-center overflow-hidden">
      <p
        className="font-body text-xs sm:text-[13px] leading-none whitespace-nowrap truncate transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="md:hidden">{current.short || current.full}</span>
        <span className="hidden md:inline whitespace-pre">{current.full}</span>
      </p>
    </div>
  )
}
