import type { CartItem } from '@/hooks/useCart'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

interface OrderSummaryProps {
  items: CartItem[]
  totalPrice: number
}

export function OrderSummary({ items, totalPrice }: OrderSummaryProps) {
  return (
    <Card className="p-6">
      <h3 className="font-subtitle font-semibold text-texto mb-4">Resumo do pedido</h3>
      <ul className="flex flex-col gap-3">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-subtitle text-texto text-sm truncate">{product.name}</p>
              <p className="text-texto/50 text-xs">
                {quantity} × {formatCurrency(product.price)}
              </p>
            </div>
            <p className="text-rosa font-semibold text-sm shrink-0">
              {formatCurrency(product.price * quantity)}
            </p>
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div className="border-t border-blush/40 mt-3 pt-3 flex justify-between font-subtitle font-semibold text-texto">
          <span>Total</span>
          <span className="text-rosa">{formatCurrency(totalPrice)}</span>
        </div>
      )}
    </Card>
  )
}
