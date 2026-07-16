import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

export interface FinancialSummaryRow {
  label: string
  orders: number
  approvedOrders: number
  revenue: number
  avgTicket: number
  deliveries: number
}

export function FinancialSummaryTable({ rows }: { rows: FinancialSummaryRow[] }) {
  const totals = rows.reduce(
    (acc, row) => ({
      orders: acc.orders + row.orders,
      approvedOrders: acc.approvedOrders + row.approvedOrders,
      revenue: acc.revenue + row.revenue,
      deliveries: acc.deliveries + row.deliveries,
    }),
    { orders: 0, approvedOrders: 0, revenue: 0, deliveries: 0 },
  )
  const totalAvgTicket = totals.approvedOrders ? totals.revenue / totals.approvedOrders : 0

  return (
    <Card className="p-5">
      <h2 className="font-subtitle font-semibold text-texto mb-4">Resumo financeiro</h2>
      {rows.length === 0 ? (
        <p className="text-texto/50 text-sm font-body">Sem dados no período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left text-texto/50 border-b border-blush/40">
                <th className="py-2 pr-3 font-subtitle font-medium">Período</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Pedidos</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Faturamento</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Ticket médio</th>
                <th className="py-2 pr-3 font-subtitle font-medium text-right">Entregas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-blush/20 last:border-0">
                  <td className="py-2 pr-3 text-texto">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{row.orders}</td>
                  <td className="py-2 pr-3 text-right">{formatCurrency(row.revenue)}</td>
                  <td className="py-2 pr-3 text-right">{formatCurrency(row.avgTicket)}</td>
                  <td className="py-2 pr-3 text-right">{row.deliveries}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2 border-blush/60">
                <td className="py-2 pr-3">Total</td>
                <td className="py-2 pr-3 text-right">{totals.orders}</td>
                <td className="py-2 pr-3 text-right">{formatCurrency(totals.revenue)}</td>
                <td className="py-2 pr-3 text-right">{formatCurrency(totalAvgTicket)}</td>
                <td className="py-2 pr-3 text-right">{totals.deliveries}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  )
}
