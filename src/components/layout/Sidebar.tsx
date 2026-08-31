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
  Megaphone,
  ShoppingCart,
  Lock,
} from 'lucide-react'
import { useStoreStatus } from '@/hooks/useStoreStatus'

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
  { to: '/admin/banner', label: 'Banner de Anúncio', icon: Megaphone },
]

interface SidebarProps {
  unreadOrders?: number
  onVisitKanban?: () => void
}

export function Sidebar({ unreadOrders = 0, onVisitKanban }: SidebarProps) {
  const location = useLocation()
  const { isOpen, loading: statusLoading, saving, setStoreOpen } = useStoreStatus()

  useEffect(() => {
    if (location.pathname === '/admin/kanban' && unreadOrders > 0) {
      onVisitKanban?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-blush/60 min-h-screen p-4 flex flex-col">
      <div className="text-xl font-title text-rosa px-2 py-3">Rosa Carmen</div>
      <nav className="flex flex-col gap-1 mt-4 flex-1">
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

      <div className="mt-4 pt-4 border-t border-blush/40">
        <button
          onClick={() => setStoreOpen(!isOpen)}
          disabled={saving || statusLoading}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-subtitle text-sm transition-colors ${
            isOpen
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          {isOpen ? <ShoppingCart size={18} /> : <Lock size={18} />}
          <span className="flex-1 text-left">
            {saving ? 'Salvando...' : isOpen ? 'Loja aberta' : 'Loja fechada'}
          </span>
          <span className={`w-8 h-4 rounded-full relative transition-colors ${isOpen ? 'bg-green-500' : 'bg-red-400'}`}>
            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${isOpen ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
      </div>
    </aside>
  )
}
