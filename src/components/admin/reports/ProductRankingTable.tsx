import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

export interface ProductRankingRow {
  productId: string
  name: string
  imageUrl: string | null
  quantity: number
  revenue: number
  percentOfTotal: number
  variation: number | null
}

const MEDALS = ['🥇', '🥈', '🥉']

function rowBackground(index: number): string {
  if (index === 0) return 'bg-[#FFF8E7]'
  if (index === 1 || index === 2) return 'bg-[#FDF0F3]'
  return index % 2 === 0 ? 'bg-white' : 'bg-[#FDFAF8]'
}

export function ProductRankingTable({ rows }: { rows: ProductRankingRow[] }) {
  return (
    <Card className="p-5">
      <h2 className="font-subtitle font-semibold text-texto mb-4">🏆 Ranking de Produtos</h2>
      {rows.length === 0 ? (
        <p className="text-texto/50 text-sm font-body">Nenhuma venda no período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left text-texto/50 border-b border-blush/40">
                <th className="py-2 pr-3 font-subtitle font-medium">#</th>
                <th className="py-2 pr-3 font-subtitle font-medium">Produto</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Qtd.</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Faturamento</th>
                <th className="py-2 pr-3 font-subtitle font-medium">% do total</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Variação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.productId} className={rowBackground(index)}>
                  <td className={`py-2.5 pr-3 ${index === 0 ? 'font-bold' : ''}`}>
                    {MEDALS[index] ?? `${index + 1}º`}
                  </td>
                  <td className={`py-2.5 pr-3 ${index === 0 ? 'font-bold' : ''}`}>
                    <div className="flex items-center gap-2">
                      {row.imageUrl ? (
                        <img src={row.imageUrl} alt={row.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-blush/40" />
                      )}
                      <span className="truncate">{row.name}</span>
                    </div>
                  </td>
                  <td className={`py-2.5 pr-3 text-right ${index === 0 ? 'font-bold' : ''}`}>{row.quantity}</td>
                  <td className={`py-2.5 pr-3 text-right ${index === 0 ? 'font-bold' : ''}`}>
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-blush/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rosa"
                          style={{ width: `${Math.min(100, row.percentOfTotal)}%` }}
                        />
                      </div>
                      <span className="text-texto/60 text-xs">{row.percentOfTotal.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.variation === null ? (
                      <span className="text-texto/40 text-xs">—</span>
                    ) : (
                      <span
                        className={`text-xs font-subtitle ${row.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {row.variation >= 0 ? '↑' : '↓'} {Math.abs(row.variation).toFixed(0)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
