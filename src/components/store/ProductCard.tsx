import type { Product } from '@/types'
import { formatCurrency } from '@/utils/format'

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group text-left bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-blush/30">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {product.featured && (
          <span className="absolute top-3 left-3 bg-dourado text-white text-[11px] font-subtitle font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
            Destaque
          </span>
        )}
      </div>

      <div className="p-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-subtitle font-semibold text-texto truncate">{product.name}</h3>
          <p className="text-rosa font-semibold mt-0.5">{formatCurrency(product.price)}</p>
        </div>
        <span className="font-subtitle font-semibold text-xs text-texto/60 group-hover:text-rosa transition-colors whitespace-nowrap shrink-0">
          Ver presente →
        </span>
      </div>
    </button>
  )
}
