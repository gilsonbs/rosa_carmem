import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

export interface RevenuePoint {
  label: string
  revenue: number
  orders: number
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="p-5">
      <h2 className="font-subtitle font-semibold text-texto mb-4">Faturamento por período</h2>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4829A" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#D4829A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2C4CE" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="revenue"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => formatCurrency(v)}
            width={90}
          />
          <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(value, name) =>
              name === 'Faturamento' ? [formatCurrency(Number(value)), name] : [value, name]
            }
          />
          <Legend />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name="Faturamento"
            stroke="#D4829A"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            name="Pedidos"
            stroke="#C9A96E"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  )
}
