import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatIsoDate } from '@/utils/format'
import type { CartItem } from '@/hooks/useCart'
import type { AddressFormData, CustomerFormData, DeliveryFormData } from '@/hooks/useCheckout'
import type { DeliveryZone } from '@/types'

interface ReviewStepProps {
  items: CartItem[]
  totalPrice: number
  customer: CustomerFormData
  address: AddressFormData
  delivery: DeliveryFormData
  zone: DeliveryZone | null
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
  zone,
  submitting,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const addressLine = `${address.street}, ${address.number}${
    address.complement ? ` - ${address.complement}` : ''
  } — ${address.neighborhood}, ${address.city}/${address.state} — CEP ${address.zip_code}`
  const deliveryFee = zone?.fee ?? 0
  const grandTotal = totalPrice + deliveryFee

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
        <div className="border-t border-blush/40 pt-3 flex flex-col gap-1.5 text-sm font-body">
          <div className="flex justify-between text-texto/70">
            <span>Produtos</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-texto/70">
            <span>Entrega{zone ? ` · ${zone.zone_name}` : ''}</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-subtitle font-semibold text-texto pt-1.5 border-t border-blush/30">
            <span>Total</span>
            <span className="text-rosa">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
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
          <dt className="text-texto/50 mb-1">Zona de entrega</dt>
          <dd className="text-texto">
            {zone ? `${zone.municipality} — ${zone.zone_name} (${formatCurrency(zone.fee)})` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-texto/50 mb-1">Data e horário</dt>
          <dd className="text-texto">
            {formatIsoDate(delivery.date)} às {delivery.time}
          </dd>
        </div>
        {delivery.personal_message.trim() && (
          <div>
            <dt className="text-texto/50 mb-1">💌 Mensagem do cartão</dt>
            <dd className="text-texto italic whitespace-pre-line rounded-lg bg-[#FDF0F3] border border-blush/50 px-3 py-2">
              {delivery.personal_message.trim()}
            </dd>
          </div>
        )}
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
