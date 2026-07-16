import type { ReactNode } from 'react'
import { formatDate } from '@/utils/format'

interface PrintLayoutProps {
  periodLabel: string
  children: ReactNode
}

export function PrintLayout({ periodLabel, children }: PrintLayoutProps) {
  return (
    <div id="print-root">
      <div className="hidden print:block mb-6">
        <div className="flex items-center justify-between border-b border-texto/20 pb-3">
          <span className="text-xl font-title text-rosa">Rosa Carmen</span>
          <div className="text-right">
            <p className="font-subtitle font-semibold">Relatório Rosa Carmen</p>
            <p className="text-xs text-texto/60">{periodLabel}</p>
          </div>
        </div>
      </div>

      {children}

      <div id="print-footer">
        Rosa Carmen — Relatório gerado em {formatDate(new Date(), "dd/MM/yyyy 'às' HH:mm")}
      </div>
    </div>
  )
}
