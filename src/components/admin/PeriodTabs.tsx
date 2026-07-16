import { PERIOD_OPTIONS, type PeriodKey } from '@/utils/period'

interface PeriodTabsProps {
  value: PeriodKey
  onChange: (key: PeriodKey) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  options?: PeriodKey[]
}

export function PeriodTabs({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  options,
}: PeriodTabsProps) {
  const tabs = options
    ? PERIOD_OPTIONS.filter((option) => options.includes(option.key))
    : PERIOD_OPTIONS

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <div className="flex gap-1 bg-white border border-blush/60 rounded-full p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-subtitle font-medium transition-colors ${
              value === tab.key ? 'bg-rosa text-white' : 'text-texto/70 hover:bg-blush/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="rounded-lg border border-blush/60 px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <span className="text-texto/40 text-sm">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="rounded-lg border border-blush/60 px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
        </div>
      )}
    </div>
  )
}
