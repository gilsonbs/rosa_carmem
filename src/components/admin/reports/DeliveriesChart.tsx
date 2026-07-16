import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

export interface DeliveryPoint {
  label: string
  confirmed: number
  preparing: number
  out_for_delivery: number
  delivered: number
}

export function DeliveriesChart({ data }: { data: DeliveryPoint[] }) {
  return (
    <Card className="p-5">
      <h2 className="font-subtitle font-semibold text-texto mb-4">Entregas por status</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2C4CE" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="confirmed" name="Confirmado" fill="#4A90D9" />
          <Bar dataKey="preparing" name="Em produção" fill="#F5A623" />
          <Bar dataKey="out_for_delivery" name="Saída p/ entrega" fill="#E67E22" />
          <Bar dataKey="delivered" name="Entregue" fill="#27AE60" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
