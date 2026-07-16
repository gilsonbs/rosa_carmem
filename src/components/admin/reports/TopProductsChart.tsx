import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Card } from '@/components/ui/Card'

export interface TopProductPoint {
  name: string
  quantity: number
}

export function TopProductsChart({ data }: { data: TopProductPoint[] }) {
  return (
    <Card className="p-5">
      <h2 className="font-subtitle font-semibold text-texto mb-4">Produtos mais vendidos no período</h2>
      {data.length === 0 ? (
        <p className="text-texto/50 text-sm font-body">Nenhuma venda no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="topProductsGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D4829A" />
                <stop offset="100%" stopColor="#C9A96E" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2C4CE" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="quantity" name="Qtd. vendida" fill="url(#topProductsGradient)" radius={[0, 6, 6, 0]}>
              <LabelList dataKey="quantity" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
