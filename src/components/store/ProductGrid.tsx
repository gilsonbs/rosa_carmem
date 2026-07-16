import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onSelectProduct: (product: Product) => void
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-blush/30" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-blush/40 rounded w-3/4" />
        <div className="h-4 bg-blush/30 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, loading, onSelectProduct }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-texto/60 font-body py-16">
        Nenhum presente disponível no momento.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
      ))}
    </div>
  )
}
