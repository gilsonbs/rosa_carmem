import { useNavigate } from 'react-router-dom'
import { X, Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/format'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart()
  const navigate = useNavigate()

  function handleCheckout() {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrinho"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blush/60">
          <h2 className="font-title text-xl text-texto">
            Carrinho
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-body text-texto/50">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="w-8 h-8 rounded-full flex items-center justify-center text-texto/60 hover:text-texto transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-4xl">🛒</p>
            <p className="font-subtitle text-texto/60">Seu carrinho está vazio.</p>
            <button
              onClick={onClose}
              className="text-sm font-subtitle text-rosa hover:underline"
            >
              Continuar explorando →
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-3 pb-0">
              <button
                onClick={onClose}
                className="text-xs font-subtitle text-texto/50 hover:text-rosa transition-colors"
              >
                ← Continuar comprando
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 items-start border-b border-blush/40 pb-4 last:border-0 last:pb-0"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-subtitle font-semibold text-texto text-sm leading-snug">
                      {product.name}
                    </p>
                    <p className="text-rosa font-semibold text-sm mt-0.5">
                      {formatCurrency(product.price * quantity)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Diminuir quantidade"
                        className="w-7 h-7 rounded-full border border-blush/60 flex items-center justify-center text-texto/60 hover:border-rosa hover:text-rosa transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-subtitle w-5 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Aumentar quantidade"
                        className="w-7 h-7 rounded-full border border-blush/60 flex items-center justify-center text-texto/60 hover:border-rosa hover:text-rosa transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label="Remover item"
                    className="text-texto/30 hover:text-red-400 transition-colors mt-0.5"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="px-5 py-4 border-t border-blush/60 flex flex-col gap-3">
              <div className="flex justify-between font-subtitle font-semibold text-texto">
                <span>Total</span>
                <span className="text-rosa">{formatCurrency(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-rosa text-white font-subtitle font-semibold py-3 rounded-full hover:bg-rosa/90 transition-colors"
              >
                Finalizar compra →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
