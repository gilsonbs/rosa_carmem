import { useState, useEffect } from 'react'
import { useAnnouncementBanner } from '@/hooks/useAnnouncementBanner'

export function AnnouncementBanner() {
  const { settings, loading } = useAnnouncementBanner()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const active = settings.messages.filter((m) => m.trim() !== '')

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

  return (
    <div className="w-full bg-rosa text-white py-2 px-4 text-center overflow-hidden">
      <p
        className="font-subtitle text-xs uppercase tracking-widest transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {active[index]}
      </p>
    </div>
  )
}
