import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Kanban,
  ShoppingBag,
  Package,
  Truck,
  Images,
  LayoutGrid,
} from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/relatorios', label: 'Relatórios', icon: TrendingUp },
  { to: '/admin/kanban', label: 'Kanban', icon: Kanban },
  { to: '/admin/produtos', label: 'Produtos', icon: ShoppingBag },
  { to: '/admin/stock', label: 'Estoque', icon: Package },
  { to: '/admin/delivery', label: 'Entregas', icon: Truck },
  { to: '/admin/hero', label: 'Hero / Carrossel', icon: Images },
  { to: '/admin/categorias', label: 'Categorias', icon: LayoutGrid },
]

interface SidebarProps {
  unreadOrders?: number
  onVisitKanban?: () => void
}

export function Sidebar({ unreadOrders = 0, onVisitKanban }: SidebarProps) {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/admin/kanban' && unreadOrders > 0) {
      onVisitKanban?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-blush/60 min-h-screen p-4">
      <div className="text-xl font-title text-rosa px-2 py-3">Rosa Carmen</div>
      <nav className="flex flex-col gap-1 mt-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-subtitle text-sm transition-colors ${
                isActive
                  ? 'bg-blush/50 text-rosa'
                  : 'text-texto/70 hover:bg-blush/30'
              }`
            }
          >
            <span className="relative">
              <Icon size={18} />
              {to === '/admin/kanban' && unreadOrders > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadOrders > 9 ? '9+' : unreadOrders}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
