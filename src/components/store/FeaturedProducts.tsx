import type { Product } from '@/types'
import { formatCurrency } from '@/utils/format'

interface FeaturedProductsProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

export function FeaturedProducts({ products, onSelectProduct }: FeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section>
      <div className="text-center mb-10">
        <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
          Seleção Especial
        </p>
        <h2 className="font-title text-3xl md:text-4xl text-texto">Em Destaque</h2>
        <div className="w-16 h-px bg-dourado mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelectProduct(product)}
            className="group text-left bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <div className="relative aspect-video overflow-hidden bg-blush/30">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              <span className="absolute top-3 left-3 bg-dourado text-white text-[11px] font-subtitle font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
                Destaque
              </span>
            </div>

            <div className="p-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-subtitle font-semibold text-lg text-texto">{product.name}</h3>
                <p className="text-rosa font-semibold text-lg mt-1">{formatCurrency(product.price)}</p>
              </div>
              <span className="font-subtitle font-semibold text-sm text-texto/70 group-hover:text-rosa transition-colors whitespace-nowrap">
                Ver presente →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
