import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatIsoDate } from '@/utils/format'
import type { CartItem } from '@/hooks/useCart'
import type { AddressFormData, CustomerFormData, DeliveryFormData } from '@/hooks/useCheckout'

interface ReviewStepProps {
  items: CartItem[]
  totalPrice: number
  customer: CustomerFormData
  address: AddressFormData
  delivery: DeliveryFormData
  submitting: boolean
  onSubmit: () => void
  onBack: () => void
}

export function ReviewStep({
  items,
  totalPrice,
  customer,
  address,
  delivery,
  submitting,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const addressLine = `${address.street}, ${address.number}${
    address.complement ? ` - ${address.complement}` : ''
  } — ${address.neighborhood}, ${address.city}/${address.state} — CEP ${address.zip_code}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-blush/60">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-subtitle text-texto text-sm">{product.name}</p>
              <p className="text-texto/50 text-xs">
                {quantity} × {formatCurrency(product.price)}
              </p>
            </div>
            <p className="text-rosa font-semibold text-sm shrink-0">
              {formatCurrency(product.price * quantity)}
            </p>
          </div>
        ))}
        {items.length > 1 && (
          <div className="border-t border-blush/40 pt-3 flex justify-between font-subtitle font-semibold text-sm text-texto">
            <span>Total</span>
            <span className="text-rosa">{formatCurrency(totalPrice)}</span>
          </div>
        )}
      </div>

      <dl className="flex flex-col gap-4 text-sm font-body">
        <div>
          <dt className="text-texto/50 mb-1">Cliente</dt>
          <dd className="text-texto">
            {customer.name} · {customer.email} · {customer.phone}
          </dd>
        </div>
        <div>
          <dt className="text-texto/50 mb-1">Endereço de entrega</dt>
          <dd className="text-texto">{addressLine}</dd>
        </div>
        <div>
          <dt className="text-texto/50 mb-1">Data e horário</dt>
          <dd className="text-texto">
            {formatIsoDate(delivery.date)} às {delivery.time}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onSubmit}
          disabled={submitting}
          size="lg"
          className="w-full flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={18} />}
          {submitting ? 'Processando...' : 'Ir para pagamento'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-sm text-texto/50 hover:text-texto/80 transition-colors text-center disabled:opacity-50"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
