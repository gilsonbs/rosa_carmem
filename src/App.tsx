import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/AuthProvider'
import { CartProvider } from '@/hooks/useCart'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { Home } from '@/pages/Home'
import { Checkout } from '@/pages/Checkout'
import { CheckoutSuccess } from '@/pages/CheckoutSuccess'
import { CheckoutFailure } from '@/pages/CheckoutFailure'
import { CheckoutPending } from '@/pages/CheckoutPending'
import { Dashboard } from '@/pages/admin/Dashboard'
import { Orders } from '@/pages/admin/Orders'
import { Relatorios } from '@/pages/admin/Relatorios'
import { Kanban } from '@/pages/admin/Kanban'
import { Produtos } from '@/pages/admin/Produtos'
import { Stock } from '@/pages/admin/Stock'
import { Delivery } from '@/pages/admin/Delivery'
import { HeroConfig } from '@/pages/admin/HeroConfig'
import { CategoryConfig } from '@/pages/admin/CategoryConfig'
import { Login } from '@/pages/admin/Login'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/failure" element={<CheckoutFailure />} />
            <Route path="/checkout/pending" element={<CheckoutPending />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="stock" element={<Stock />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="hero" element={<HeroConfig />} />
            <Route path="categorias" element={<CategoryConfig />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
