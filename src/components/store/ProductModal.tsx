import { useState } from 'react'
import { X, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/format'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onOpenCart: () => void
}

export function ProductModal({ product, onClose, onOpenCart }: ProductModalProps) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  if (!product) return null

  const inCart = items.some((i) => i.product.id === product.id)

  function handleAdd() {
    addItem(product!)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleViewCart() {
    onClose()
    onOpenCart()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-texto/60 hover:text-texto transition-colors"
        >
          <X size={20} />
        </button>

        <div className="aspect-square md:aspect-auto bg-blush/30">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-8 flex flex-col gap-4">
          <h2 className="font-title text-3xl text-texto">{product.name}</h2>
          {product.description && (
            <p className="font-body text-gray-500 leading-relaxed">{product.description}</p>
          )}
          <p className="text-xl md:text-2xl font-semibold text-rosa">
            {formatCurrency(product.price)}
          </p>

          <button
            onClick={added ? undefined : handleAdd}
            className={`mt-auto w-full font-subtitle font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 ${
              added
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-rosa text-white hover:bg-rosa/90'
            }`}
          >
            {added ? (
              <>
                <Check size={18} /> Adicionado ao carrinho!
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Adicionar ao carrinho
              </>
            )}
          </button>

          {inCart && !added && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleViewCart}
                className="text-sm font-subtitle text-rosa hover:underline text-center"
              >
                Ver carrinho →
              </button>
              <button
                onClick={onClose}
                className="text-sm font-subtitle text-texto/40 hover:text-texto/70 transition-colors text-center"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
