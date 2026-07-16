import type { LucideIcon } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** Variação % vs. o período anterior. `null`/`undefined` = sem comparação disponível. */
  trend?: number | null
  trendLabel?: string
  /** Texto neutro (sem seta/cor) exibido no lugar do trend, ex.: "87% concluídas". */
  note?: string
  /** Últimos N pontos para o mini gráfico de tendência. */
  sparkline?: number[]
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, note, sparkline }: StatCardProps) {
  const hasTrend = trend !== undefined && trend !== null
  const isPositive = hasTrend && trend >= 0
  const hasSparkline = sparkline && sparkline.length > 1

  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-blush/50 flex items-center justify-center text-rosa shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-texto/60 font-subtitle">{label}</p>
        <p className="text-xl font-semibold text-texto">{value}</p>
        {hasTrend && (
          <p className={`text-xs font-subtitle mt-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}% {trendLabel ?? 'vs período anterior'}
          </p>
        )}
        {!hasTrend && note && <p className="text-xs font-subtitle mt-0.5 text-texto/50">{note}</p>}
      </div>
      {hasSparkline && (
        <div className="w-16 h-8 shrink-0 print:hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((v, i) => ({ v, i }))}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkline[sparkline.length - 1] >= sparkline[0] ? '#27AE60' : '#E74C3C'}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
