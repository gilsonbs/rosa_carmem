import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import type { ProductRankingRow } from './ProductRankingTable'

export function ChampionCard({ champion }: { champion: ProductRankingRow | null }) {
  if (!champion) return null

  return (
    <Card
      className="p-6 flex items-center gap-5"
      style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FDF0F3 100%)' }}
    >
      {champion.imageUrl ? (
        <img
          src={champion.imageUrl}
          alt={champion.name}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-blush/40 shrink-0" />
      )}
      <div>
        <p className="text-xs font-subtitle text-dourado font-semibold uppercase tracking-wide">
          🏆 Produto Campeão do Período
        </p>
        <p className="text-xl font-title text-texto mt-1">{champion.name}</p>
        <p className="text-sm font-body text-texto/70 mt-1">
          {champion.quantity} vendidos · {formatCurrency(champion.revenue)} em faturamento
        </p>
      </div>
    </Card>
  )
}
