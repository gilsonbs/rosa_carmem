import { useMemo } from 'react'
import type { OrderWithRelations } from '@/types'
import {
  type PeriodRange,
  type GroupGranularity,
  isWithinRange,
  bucketKeyForDate,
  generateBuckets,
  percentChange,
} from '@/utils/period'

export interface ReportChartPoint {
  label: string
  revenue: number
  orders: number
}

export interface ReportMetrics {
  periodOrders: OrderWithRelations[]
  previousPeriodOrders: OrderWithRelations[]
  approvedPeriodOrders: OrderWithRelations[]
  approvedPreviousOrders: OrderWithRelations[]
  revenue: number
  previousRevenue: number
  totalOrders: number
  previousTotalOrders: number
  avgTicket: number
  deliveries: number
  deliveriesPercent: number
  revenueTrend: number | null
  ordersTrend: number | null
  avgTicketTrend: number | null
  chartData: ReportChartPoint[]
}

/** Métricas de faturamento/pedidos/ticket/entregas para um período, comparadas com o período anterior. */
export function useReportMetrics(
  orders: OrderWithRelations[],
  range: PeriodRange,
  previousRange: PeriodRange,
  granularity: GroupGranularity,
): ReportMetrics {
  return useMemo(() => {
    const periodOrders = orders.filter((order) => isWithinRange(new Date(order.created_at), range))
    const previousPeriodOrders = orders.filter((order) =>
      isWithinRange(new Date(order.created_at), previousRange),
    )
    const approvedPeriodOrders = periodOrders.filter((order) => order.payment_status === 'approved')
    const approvedPreviousOrders = previousPeriodOrders.filter((order) => order.payment_status === 'approved')

    const revenue = approvedPeriodOrders.reduce((sum, order) => sum + order.amount, 0)
    const previousRevenue = approvedPreviousOrders.reduce((sum, order) => sum + order.amount, 0)
    const totalOrders = periodOrders.length
    const previousTotalOrders = previousPeriodOrders.length
    const avgTicket = approvedPeriodOrders.length ? revenue / approvedPeriodOrders.length : 0
    const previousAvgTicket = approvedPreviousOrders.length ? previousRevenue / approvedPreviousOrders.length : 0
    const deliveries = periodOrders.filter((order) => order.order_status === 'delivered').length
    const deliveriesPercent = totalOrders ? (deliveries / totalOrders) * 100 : 0

    const buckets = generateBuckets(range, granularity)
    const revenueByBucket = new Map<string, number>()
    const ordersByBucket = new Map<string, number>()
    for (const bucket of buckets) {
      revenueByBucket.set(bucket.key, 0)
      ordersByBucket.set(bucket.key, 0)
    }
    for (const order of periodOrders) {
      const key = bucketKeyForDate(new Date(order.created_at), granularity)
      ordersByBucket.set(key, (ordersByBucket.get(key) ?? 0) + 1)
      if (order.payment_status === 'approved') {
        revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + order.amount)
      }
    }
    const chartData = buckets.map((bucket) => ({
      label: bucket.label,
      revenue: revenueByBucket.get(bucket.key) ?? 0,
      orders: ordersByBucket.get(bucket.key) ?? 0,
    }))

    return {
      periodOrders,
      previousPeriodOrders,
      approvedPeriodOrders,
      approvedPreviousOrders,
      revenue,
      previousRevenue,
      totalOrders,
      previousTotalOrders,
      avgTicket,
      deliveries,
      deliveriesPercent,
      revenueTrend: percentChange(revenue, previousRevenue),
      ordersTrend: percentChange(totalOrders, previousTotalOrders),
      avgTicketTrend: percentChange(avgTicket, previousAvgTicket),
      chartData,
    }
  }, [orders, range, previousRange, granularity])
}
