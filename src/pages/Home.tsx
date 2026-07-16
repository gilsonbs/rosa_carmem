import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductModal } from '@/components/store/ProductModal'
import { CartDrawer } from '@/components/store/CartDrawer'
import type { Product } from '@/types'

export function Home() {
  const { products, featuredProducts, loading, error } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <section
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #F2C4CE 0px, #F2C4CE 24px, #E8AFC0 24px, #E8AFC0 48px)',
        }}
      >
        <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-texto/60">
          Rosa Carmen · Boutique de Presentes
        </p>
        <h1 className="font-title text-4xl md:text-5xl text-texto mt-4">
          Presentes que tocam o coração.
        </h1>
        <p className="font-subtitle font-light text-lg text-texto/70 mt-3 max-w-xl">
          Curadoria de presentes elegantes para os momentos que merecem ser lembrados.
        </p>
        <a
          href="#presentes"
          className="mt-8 inline-block bg-white text-texto font-subtitle font-medium uppercase tracking-wide text-sm px-8 py-3.5 rounded hover:bg-texto hover:text-white transition-colors"
        >
          Explorar a Coleção
        </a>
      </section>

      <section id="presentes" className="py-16 px-6 bg-[#FDF0F3]">
        <div className="max-w-6xl mx-auto">
          <FeaturedProducts products={featuredProducts} onSelectProduct={setSelectedProduct} />
        </div>
      </section>

      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
              A Vitrine Completa
            </p>
            <h2 className="font-title text-3xl md:text-4xl text-texto">Todos os Presentes</h2>
          </div>
          {error && (
            <p className="text-center text-red-600 font-body mb-6">{error}</p>
          )}
          <ProductGrid
            products={products}
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
