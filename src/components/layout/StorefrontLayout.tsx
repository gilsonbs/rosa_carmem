import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnnouncementBanner } from '@/components/store/AnnouncementBanner'
import { BenefitsStrip } from '@/components/store/BenefitsStrip'

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BenefitsStrip />
      <Footer />
    </div>
  )
}
