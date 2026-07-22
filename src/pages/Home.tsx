import { useMemo, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useHeroSettings } from '@/hooks/useHeroSettings'
import { useDynamicCategories } from '@/hooks/useDynamicCategories'
import { HeroCarousel } from '@/components/store/HeroCarousel'
import { CategoryStrip } from '@/components/store/CategoryStrip'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductModal } from '@/components/store/ProductModal'
import { CartDrawer } from '@/components/store/CartDrawer'
import type { Product } from '@/types'

export function Home() {
  const { products, featuredProducts, loading, error } = useProducts()
  const { settings: heroSettings, heroProducts } = useHeroSettings()
  const { categories } = useDynamicCategories()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    for (const p of products) {
      const key = p.category ?? ''
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(p)
    }
    return grouped
  }, [products])

  // Only categories that actually have products, in configured order
  const categoriesWithProducts = useMemo(
    () => categories.filter((cat) => (productsByCategory[cat.value]?.length ?? 0) > 0),
    [categories, productsByCategory],
  )

  // Products with no category assigned
  const uncategorized = productsByCategory[''] ?? []

  const bgFor = (index: number) => (index % 2 === 0 ? 'bg-fundo' : 'bg-[#FDF0F3]')

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

      {/* Destaques */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-6 bg-[#FDF0F3]">
          <div className="max-w-6xl mx-auto">
            <FeaturedProducts products={featuredProducts} onSelectProduct={setSelectedProduct} />
          </div>
        </section>
      )}

      {error && (
        <p className="text-center text-red-600 font-body py-6">{error}</p>
      )}

      {/* Seção por categoria */}
      {categoriesWithProducts.map((cat, i) => (
        <section
          key={cat.value}
          id={`cat-${cat.value}`}
          className={`py-16 px-6 ${bgFor(i)}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
                Categoria
              </p>
              <h2 className="font-title text-3xl md:text-4xl text-texto">{cat.label}</h2>
            </div>
            <ProductGrid
              products={productsByCategory[cat.value]}
              loading={false}
              onSelectProduct={setSelectedProduct}
            />
          </div>
        </section>
      ))}

      {/* Produtos sem categoria */}
      {(loading || uncategorized.length > 0) && (
        <section
          id="presentes"
          className={`py-16 px-6 ${bgFor(categoriesWithProducts.length)}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
                A Vitrine Completa
              </p>
              <h2 className="font-title text-3xl md:text-4xl text-texto">Todos os Presentes</h2>
            </div>
            <ProductGrid
              products={uncategorized}
              loading={loading}
              onSelectProduct={setSelectedProduct}
            />
          </div>
        </section>
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
