import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, DollarSign, Target, Truck, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrders } from '@/hooks/useOrders'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { useReportMetrics } from '@/hooks/useReportMetrics'
import { formatCurrency, formatDate, getTodayIso } from '@/utils/format'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '@/utils/orderStatus'
import { getPeriodRange, getPreviousPeriodRange, getGroupGranularity, PERIOD_OPTIONS, type PeriodKey } from '@/utils/period'

const LOW_STOCK_THRESHOLD = 5
const RECENT_ORDERS_LIMIT = 5
const LOW_STOCK_LIMIT = 5
const DASHBOARD_PERIODS: PeriodKey[] = ['today', 'month', 'year']

export function Dashboard() {
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, loading: productsLoading, error: productsError } = useAdminProducts()

  const [periodKey, setPeriodKey] = useState<PeriodKey>('today')

  const range = useMemo(() => getPeriodRange(periodKey), [periodKey])
  const previousRange = useMemo(() => getPreviousPeriodRange(range), [range])
  const granularity = useMemo(() => getGroupGranularity(range), [range])
  const metrics = useReportMetrics(orders, range, previousRange, granularity)

  const revenueSparkline = useMemo(() => metrics.chartData.map((p) => p.revenue).slice(-7), [metrics.chartData])
  const ordersSparkline = useMemo(() => metrics.chartData.map((p) => p.orders).slice(-7), [metrics.chartData])
  const avgTicketSparkline = useMemo(
    () => metrics.chartData.map((p) => (p.orders ? p.revenue / p.orders : 0)).slice(-7),
    [metrics.chartData],
  )

  const loading = ordersLoading || productsLoading
  const error = ordersError || productsError

  const todayDeliveries = useMemo(() => {
    const today = getTodayIso()
    return orders
      .filter(
        (order) =>
          order.delivery_date === today &&
          order.payment_status === 'approved' &&
          order.order_status !== 'cancelled',
      )
      .sort((a, b) => (a.delivery_time ?? '').localeCompare(b.delivery_time ?? ''))
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, RECENT_ORDERS_LIMIT), [orders])

  const lowStockProducts = useMemo(() => {
    return products
      .map((product) => ({
        id: product.id,
        name: product.name,
        totalStock: product.stock,
      }))
      .filter((product) => product.totalStock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, LOW_STOCK_LIMIT)
  }, [products])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-title text-texto">Dashboard</h1>
        <div className="flex gap-1 bg-white border border-blush/60 rounded-full p-1">
          {PERIOD_OPTIONS.filter((option) => DASHBOARD_PERIODS.includes(option.key)).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setPeriodKey(option.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-subtitle font-medium transition-colors ${
                periodKey === option.key ? 'bg-rosa text-white' : 'text-texto/70 hover:bg-blush/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <StatCard
          label="Faturamento"
          value={loading ? '—' : formatCurrency(metrics.revenue)}
          icon={DollarSign}
          trend={loading ? null : metrics.revenueTrend}
          sparkline={revenueSparkline}
        />
        <StatCard
          label="Pedidos"
          value={loading ? '—' : String(metrics.totalOrders)}
          icon={ShoppingBag}
          trend={loading ? null : metrics.ordersTrend}
          sparkline={ordersSparkline}
        />
        <StatCard
          label="Ticket médio"
          value={loading ? '—' : formatCurrency(metrics.avgTicket)}
          icon={Target}
          trend={loading ? null : metrics.avgTicketTrend}
          sparkline={avgTicketSparkline}
        />
        <StatCard
          label="Entregas realizadas"
          value={loading ? '—' : String(metrics.deliveries)}
          icon={Truck}
          note={loading ? undefined : `${metrics.deliveriesPercent.toFixed(0)}% concluídas`}
        />
      </div>

      <Link
        to="/admin/relatorios"
        className="inline-flex items-center gap-1 text-sm font-subtitle text-rosa hover:text-rosa/70 transition-colors mb-8"
      >
        Ver relatório completo <ArrowRight size={14} />
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-subtitle font-semibold text-texto">Entregas de hoje</h2>
            <Link to="/admin/delivery">
              <Button variant="outline" size="sm">
                Ver todas as entregas
              </Button>
            </Link>
          </div>
          {loading && <p className="text-texto/50 text-sm font-body">Carregando...</p>}
          {!loading && todayDeliveries.length === 0 && (
            <p className="text-texto/50 text-sm font-body">Nenhuma entrega agendada para hoje.</p>
          )}
          {!loading && todayDeliveries.length > 0 && (
            <ul className="flex flex-col gap-3">
              {todayDeliveries.map((order) => (
                <li key={order.id} className="flex items-center justify-between text-sm font-body">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-subtitle font-semibold text-rosa shrink-0">
                      {order.delivery_time?.slice(0, 5) ?? '—'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-texto truncate">{order.customer.name}</p>
                      <p className="text-texto/50 text-xs truncate">
                        {order.neighborhood}, {order.city}
                      </p>
                    </div>
                  </div>
                  <Badge tone={ORDER_STATUS_TONE[order.order_status]}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-subtitle font-semibold text-texto mb-4">Estoque baixo</h2>
          {loading && <p className="text-texto/50 text-sm font-body">Carregando...</p>}
          {!loading && lowStockProducts.length === 0 && (
            <p className="text-texto/50 text-sm font-body">Nenhum produto com estoque baixo.</p>
          )}
          {!loading && lowStockProducts.length > 0 && (
            <ul className="flex flex-col gap-3">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between text-sm font-body">
                  <span className="text-texto truncate">{product.name}</span>
                  <Badge tone={product.totalStock === 0 ? 'danger' : 'dourado'}>
                    {product.totalStock} em estoque
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-subtitle font-semibold text-texto mb-4">Últimos pedidos</h2>
        {loading && <p className="text-texto/50 text-sm font-body">Carregando...</p>}
        {!loading && recentOrders.length === 0 && (
          <p className="text-texto/50 text-sm font-body">Nenhum pedido ainda.</p>
        )}
        {!loading && recentOrders.length > 0 && (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between text-sm font-body">
                <div className="min-w-0">
                  <p className="text-texto truncate">{order.customer.name}</p>
                  <p className="text-texto/50 text-xs truncate">{order.product.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge tone={ORDER_STATUS_TONE[order.order_status]}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </Badge>
                  <span className="text-texto/40 text-xs">{formatDate(order.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
