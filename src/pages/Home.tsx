import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { useHeroSettings } from '@/hooks/useHeroSettings'
import { HeroCarousel } from '@/components/store/HeroCarousel'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductModal } from '@/components/store/ProductModal'
import { CartDrawer } from '@/components/store/CartDrawer'
import { useDynamicCategories } from '@/hooks/useDynamicCategories'
import { CategoryStrip } from '@/components/store/CategoryStrip'
import type { Product } from '@/types'

export function Home() {
  const { products, featuredProducts, loading, error } = useProducts()
  const { settings: heroSettings, heroProducts } = useHeroSettings()
  const { getCategoryLabel } = useDynamicCategories()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('categoria')

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  return (
    <>
      <HeroCarousel
        products={heroProducts}
        autoAdvance={heroSettings.auto_advance}
        intervalSeconds={heroSettings.interval_seconds}
        showPrice={heroSettings.show_price}
        onSelectProduct={setSelectedProduct}
      />

      <CategoryStrip />

      <section className="py-16 px-6 bg-[#FDF0F3]">
        <div className="max-w-6xl mx-auto">
          <FeaturedProducts products={featuredProducts} onSelectProduct={setSelectedProduct} />
        </div>
      </section>

      <section id="presentes" className="py-16 px-6 bg-fundo">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
              {activeCategory ? 'Categoria' : 'A Vitrine Completa'}
            </p>
            <h2 className="font-title text-3xl md:text-4xl text-texto">
              {activeCategory ? getCategoryLabel(activeCategory) : 'Todos os Presentes'}
            </h2>
          </div>
          {error && (
            <p className="text-center text-red-600 font-body mb-6">{error}</p>
          )}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onSelectProduct={setSelectedProduct}
          />
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
