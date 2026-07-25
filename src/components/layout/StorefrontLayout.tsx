import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnnouncementBanner } from '@/components/store/AnnouncementBanner'

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
