import { useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, Target, Truck } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { useReportMetrics } from '@/hooks/useReportMetrics'
import { StatCard } from '@/components/admin/StatCard'
import { PeriodTabs } from '@/components/admin/PeriodTabs'
import { ReportActions } from '@/components/admin/ReportActions'
import { PrintLayout } from '@/components/admin/PrintLayout'
import { RevenueChart } from '@/components/admin/reports/RevenueChart'
import { DeliveriesChart } from '@/components/admin/reports/DeliveriesChart'
import { TopProductsChart } from '@/components/admin/reports/TopProductsChart'
import { ChampionCard } from '@/components/admin/reports/ChampionCard'
import { ProductRankingTable, type ProductRankingRow } from '@/components/admin/reports/ProductRankingTable'
import { FinancialSummaryTable } from '@/components/admin/reports/FinancialSummaryTable'
import { DeliveriesReportTable } from '@/components/admin/reports/DeliveriesReportTable'
import { formatCurrency } from '@/utils/format'
import { formatAddress } from '@/utils/address'
import { ORDER_STATUS_LABELS } from '@/utils/orderStatus'
import { downloadCsv, downloadMultiSectionCsv } from '@/utils/csv'
import {
  getPeriodRange,
  getPreviousPeriodRange,
  getGroupGranularity,
  generateBuckets,
  generateSummaryRanges,
  bucketKeyForDate,
  isWithinRange,
  formatPeriodRangeLabel,
  percentChange,
  type PeriodKey,
} from '@/utils/period'
import { getTodayIso } from '@/utils/format'

const DELIVERY_STATUSES = new Set(['confirmed', 'preparing', 'out_for_delivery', 'delivered'])

export function Relatorios() {
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, loading: productsLoading, error: productsError } = useAdminProducts()

  const [periodKey, setPeriodKey] = useState<PeriodKey>('month')
  const [customStart, setCustomStart] = useState(getTodayIso())
  const [customEnd, setCustomEnd] = useState(getTodayIso())

  const range = useMemo(
    () => getPeriodRange(periodKey, customStart, customEnd),
    [periodKey, customStart, customEnd],
  )
  const previousRange = useMemo(() => getPreviousPeriodRange(range), [range])
  const granularity = useMemo(() => getGroupGranularity(range), [range])
  const summaryRanges = useMemo(() => generateSummaryRanges(range), [range])

  const metrics = useReportMetrics(orders, range, previousRange, granularity)
  const { periodOrders, approvedPeriodOrders, approvedPreviousOrders, revenue } = metrics

  const buckets = useMemo(() => generateBuckets(range, granularity), [range, granularity])

  const deliveriesChartData = useMemo(() => {
    type Counts = { confirmed: number; preparing: number; out_for_delivery: number; delivered: number }
    const counts = new Map<string, Counts>()
    for (const bucket of buckets) {
      counts.set(bucket.key, { confirmed: 0, preparing: 0, out_for_delivery: 0, delivered: 0 })
    }
    for (const order of periodOrders) {
      if (!DELIVERY_STATUSES.has(order.order_status)) continue
      const key = bucketKeyForDate(new Date(order.created_at), granularity)
      const entry = counts.get(key)
      if (entry) entry[order.order_status as keyof Counts] += 1
    }
    return buckets.map((bucket) => ({ label: bucket.label, ...(counts.get(bucket.key) as Counts) }))
  }, [buckets, periodOrders, granularity])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const rankingRows: ProductRankingRow[] = useMemo(() => {
    const sales = new Map<string, { quantity: number; revenue: number }>()
    for (const order of approvedPeriodOrders) {
      const entry = sales.get(order.product_id) ?? { quantity: 0, revenue: 0 }
      entry.quantity += 1
      entry.revenue += order.amount
      sales.set(order.product_id, entry)
    }

    const previousSales = new Map<string, number>()
    for (const order of approvedPreviousOrders) {
      previousSales.set(order.product_id, (previousSales.get(order.product_id) ?? 0) + 1)
    }

    const rows = Array.from(sales.entries()).map(([productId, sale]) => {
      const product = productById.get(productId)
      return {
        productId,
        name: product?.name ?? 'Produto removido',
        imageUrl: product?.image_url ?? null,
        quantity: sale.quantity,
        revenue: sale.revenue,
        percentOfTotal: revenue ? (sale.revenue / revenue) * 100 : 0,
        variation: percentChange(sale.quantity, previousSales.get(productId) ?? 0),
      }
    })

    rows.sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    return rows.slice(0, 10)
  }, [approvedPeriodOrders, approvedPreviousOrders, productById, revenue])

  const topProductsChartData = useMemo(
    () => rankingRows.slice(0, 5).map((row) => ({ name: row.name, quantity: row.quantity })),
    [rankingRows],
  )

  const champion = rankingRows[0] ?? null

  const financialSummaryRows = useMemo(() => {
    return summaryRanges.map((summaryRange) => {
      const rangeOrders = orders.filter((order) => {
        const created = new Date(order.created_at)
        return created >= summaryRange.start && created <= summaryRange.end
      })
      const approved = rangeOrders.filter((order) => order.payment_status === 'approved')
      const rev = approved.reduce((sum, order) => sum + order.amount, 0)
      return {
        label: summaryRange.label,
        orders: rangeOrders.length,
        approvedOrders: approved.length,
        revenue: rev,
        avgTicket: approved.length ? rev / approved.length : 0,
        deliveries: rangeOrders.filter((order) => order.order_status === 'delivered').length,
      }
    })
  }, [summaryRanges, orders])

  const deliveryRangeOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order.delivery_date) return false
      const [y, m, d] = order.delivery_date.split('-').map(Number)
      return isWithinRange(new Date(y, m - 1, d), range)
    })
  }, [orders, range])

  function handleExportCsv() {
    downloadMultiSectionCsv(`rosa-carmen-relatorio-${periodKey}.csv`, [
      {
        title: 'Resumo Financeiro',
        rows: financialSummaryRows.map((row) => ({
          Periodo: row.label,
          Pedidos: row.orders,
          Faturamento: row.revenue.toFixed(2),
          TicketMedio: row.avgTicket.toFixed(2),
          Entregas: row.deliveries,
        })),
      },
      {
        title: 'Ranking de Produtos',
        rows: rankingRows.map((row, index) => ({
          Posicao: index + 1,
          Produto: row.name,
          Quantidade: row.quantity,
          Faturamento: row.revenue.toFixed(2),
          PercentualDoTotal: row.percentOfTotal.toFixed(1),
        })),
      },
    ])

    downloadCsv(
      `rosa-carmen-entregas-${periodKey}.csv`,
      deliveryRangeOrders.map((order) => ({
        Data: order.delivery_date ?? '',
        Horario: order.delivery_time?.slice(0, 5) ?? '',
        Cliente: order.customer.name,
        Produto: order.product.name,
        Endereco: formatAddress(order, true),
        Status: ORDER_STATUS_LABELS[order.order_status],
      })),
    )
  }

  const loading = ordersLoading || productsLoading
  const error = ordersError || productsError

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 print:hidden">
        <h1 className="text-2xl font-title text-texto">Relatórios</h1>
        <ReportActions onExportCsv={handleExportCsv} />
      </div>

      <PrintLayout periodLabel={formatPeriodRangeLabel(range)}>
        <div className="mb-6">
          <PeriodTabs
            value={periodKey}
            onChange={setPeriodKey}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </div>

        {loading && <p className="text-texto/60">Carregando relatório...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print-section">
              <StatCard
                label="Faturamento Total"
                value={formatCurrency(metrics.revenue)}
                icon={DollarSign}
                trend={metrics.revenueTrend}
              />
              <StatCard
                label="Total de Pedidos"
                value={String(metrics.totalOrders)}
                icon={ShoppingBag}
                trend={metrics.ordersTrend}
              />
              <StatCard
                label="Ticket Médio"
                value={formatCurrency(metrics.avgTicket)}
                icon={Target}
                trend={metrics.avgTicketTrend}
              />
              <StatCard
                label="Entregas Realizadas"
                value={String(metrics.deliveries)}
                icon={Truck}
                note={`${metrics.deliveriesPercent.toFixed(0)}% concluídas`}
              />
            </div>

            <div className="mb-6 print-section">
              <RevenueChart data={metrics.chartData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print-section">
              <DeliveriesChart data={deliveriesChartData} />
              <TopProductsChart data={topProductsChartData} />
            </div>

            <div className="flex flex-col gap-6 mb-6 print-section">
              <ChampionCard champion={champion} />
              <ProductRankingTable rows={rankingRows} />
            </div>

            <div className="mb-6 print-section">
              <FinancialSummaryTable rows={financialSummaryRows} />
            </div>

            <div className="print-section">
              <DeliveriesReportTable orders={deliveryRangeOrders} />
            </div>
          </>
        )}
      </PrintLayout>
    </div>
  )
}
