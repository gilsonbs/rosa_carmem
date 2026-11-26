import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { useHeroSettings } from '@/hooks/useHeroSettings'
import { useCategories } from '@/hooks/useCategories'
import { HeroCarousel } from '@/components/store/HeroCarousel'
import { CategoryStrip } from '@/components/store/CategoryStrip'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductModal } from '@/components/store/ProductModal'
import { CartDrawer } from '@/components/store/CartDrawer'
import type { Product } from '@/types'

const pillBase =
  'shrink-0 rounded-full border px-4 py-1.5 font-subtitle text-xs uppercase tracking-wider transition-colors whitespace-nowrap'
const pillActive = 'bg-rosa border-rosa text-white'
const pillInactive = 'border-rosa text-rosa bg-white hover:bg-rosa/10'

export function Home() {
  const { products, featuredProducts, loading, error } = useProducts()
  const { settings: heroSettings, heroProducts } = useHeroSettings()
  const { categories } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  // Só mostra no filtro as categorias que têm algum produto disponível
  const categoriesWithProducts = useMemo(() => {
    const used = new Set(products.flatMap((p) => p.category_ids ?? []))
    return categories.filter((c) => used.has(c.id))
  }, [categories, products])

  // Categoria selecionada vem da URL (?categoria=slug), assim o menu do
  // header e os círculos da CategoryStrip controlam o mesmo filtro.
  const activeSlug = searchParams.get('categoria')
  const activeCategory = categories.find((c) => c.slug === activeSlug) ?? null

  const visibleProducts = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category_ids?.includes(activeCategory.id))
        : products,
    [products, activeCategory],
  )

  function selectCategory(slug: string | null) {
    setSearchParams(slug ? { categoria: slug } : {}, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <HeroCarousel
        products={heroProducts}
        autoAdvance={heroSettings.auto_advance}
        intervalSeconds={heroSettings.interval_seconds}
        showPrice={heroSettings.show_price}
        onSelectProduct={setSelectedProduct}
      />

      <CategoryStrip categories={categoriesWithProducts} />

      {featuredProducts.length > 0 && (
        <section className="py-16 px-6 bg-[#FDF0F3]">
          <div className="max-w-6xl mx-auto">
            <FeaturedProducts products={featuredProducts} onSelectProduct={setSelectedProduct} />
          </div>
        </section>
      )}

      {error && <p className="text-center text-red-600 font-body py-6">{error}</p>}

      <section id="presentes" className="py-16 px-6 bg-fundo scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
              A Vitrine Completa
            </p>
            <h2 className="font-title text-3xl md:text-4xl text-texto">
              {activeCategory ? activeCategory.name : 'Todos os Presentes'}
            </h2>
          </div>

          {categoriesWithProducts.length > 0 && (
            <div
              role="tablist"
              aria-label="Filtrar por categoria"
              className="flex gap-2 overflow-x-auto scrollbar-hide justify-start md:justify-center pb-2 mb-10 -mx-6 px-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!activeCategory}
                onClick={() => selectCategory(null)}
                className={`${pillBase} ${!activeCategory ? pillActive : pillInactive}`}
              >
                Todos
              </button>
              {categoriesWithProducts.map((cat) => {
                const isActive = activeCategory?.id === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectCategory(isActive ? null : cat.slug)}
                    className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          <ProductGrid
            products={visibleProducts}
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
