import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useNewOrderAlerts } from '@/hooks/useNewOrderAlerts'

export function AdminLayout() {
  const { count, resetCount } = useNewOrderAlerts()

  return (
    <div className="min-h-screen flex bg-fundo">
      <Sidebar unreadOrders={count} onVisitKanban={resetCount} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
