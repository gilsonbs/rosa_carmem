import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CustomerForm } from '@/components/checkout/CustomerForm'
import { DeliveryAddressForm } from '@/components/checkout/DeliveryAddressForm'
import { Button } from '@/components/ui/Button'
import { onlyDigits } from '@/utils/mask'
import { formatCurrency } from '@/utils/format'
import type { CustomerFormData, AddressFormData, DeliveryFormData } from '@/hooks/useCheckout'
import type { ManualOrderInput } from '@/hooks/useOrders'
import type { ProductWithStock } from '@/hooks/useAdminProducts'

interface ManualOrderFormProps {
  products: ProductWithStock[]
  onSubmit: (input: ManualOrderInput) => Promise<void>
  onCancel: () => void
}

interface LineItem {
  product_id: string
  quantity: number
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialCustomer: CustomerFormData = { name: '', email: '', phone: '' }
const initialAddress: AddressFormData = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip_code: '',
}
const initialDelivery: DeliveryFormData = { date: '', time: '' }

const inputClasses =
  'w-full rounded-lg border border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'
const labelClasses = 'block font-subtitle text-sm text-texto/80 mb-1.5'

export function ManualOrderForm({ products, onSubmit, onCancel }: ManualOrderFormProps) {
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomer)
  const [address, setAddress] = useState<AddressFormData>(initialAddress)
  const [delivery, setDelivery] = useState<DeliveryFormData>(initialDelivery)
  const [lines, setLines] = useState<LineItem[]>([{ product_id: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)

  const availableProducts = products.filter((p) => p.active && p.stock > 0)

  function setLine(index: number, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, { product_id: '', quantity: 1 }])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function getProduct(id: string): ProductWithStock | undefined {
    return products.find((p) => p.id === id)
  }

  const totalAmount = lines.reduce((sum, l) => {
    const p = getProduct(l.product_id)
    return sum + (p ? p.price * l.quantity : 0)
  }, 0)

  function validate(): boolean {
    if (!customer.name.trim()) { toast.error('Informe o nome do cliente'); return false }
    if (!EMAIL_REGEX.test(customer.email.trim())) { toast.error('Informe um e-mail válido'); return false }
    if (onlyDigits(customer.phone).length < 10) { toast.error('Informe um telefone válido com DDD'); return false }

    for (const line of lines) {
      if (!line.product_id) { toast.error('Selecione o produto em todos os itens'); return false }
      if (line.quantity < 1) { toast.error('Quantidade mínima é 1'); return false }
    }

    if (onlyDigits(address.zip_code).length !== 8) { toast.error('Informe um CEP válido'); return false }
    if (!address.street.trim() || !address.number.trim() || !address.neighborhood.trim()) {
      toast.error('Preencha o endereço completo'); return false
    }
    if (!address.city.trim() || !address.state.trim()) { toast.error('Preencha cidade e estado'); return false }
    if (!delivery.date) { toast.error('Selecione a data de entrega'); return false }
    if (!delivery.time) { toast.error('Selecione o horário de entrega'); return false }
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await onSubmit({
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: onlyDigits(customer.phone),
        },
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price: getProduct(l.product_id)!.price,
        })),
        amount: totalAmount,
        address: {
          street: address.street.trim(),
          number: address.number.trim(),
          complement: address.complement.trim() || undefined,
          neighborhood: address.neighborhood.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          zip_code: onlyDigits(address.zip_code),
        },
        delivery_date: delivery.date,
        delivery_time: delivery.time,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-xs font-body text-texto/50 -mt-2">
        Para pedidos combinados por fora (ex.: WhatsApp). O pedido já entra como pago e confirmado,
        e o estoque é baixado na hora.
      </p>

      <CustomerForm value={customer} onChange={(patch) => setCustomer((prev) => ({ ...prev, ...patch }))} />

      <div className="border-t border-blush/40 pt-5 flex flex-col gap-4">
        <p className={labelClasses}>Produtos</p>

        {lines.map((line, index) => {
          const selectedProduct = getProduct(line.product_id)
          return (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <select
                  value={line.product_id}
                  onChange={(e) => setLine(index, { product_id: e.target.value })}
                  className={inputClasses}
                >
                  <option value="" disabled>Selecione</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => setLine(index, { quantity: Math.max(1, Number(e.target.value)) })}
                  className={inputClasses}
                />
              </div>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="mb-0.5 p-2 text-texto/30 hover:text-red-400 transition-colors"
                  aria-label="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {selectedProduct && (
                <p className="text-xs text-texto/40 mt-1 self-center whitespace-nowrap">
                  {formatCurrency(selectedProduct.price * line.quantity)}
                </p>
              )}
            </div>
          )
        })}

        <button
          type="button"
          onClick={addLine}
          className="flex items-center gap-1.5 text-sm font-subtitle text-rosa hover:underline w-fit"
        >
          <Plus size={15} /> Adicionar produto
        </button>

        {totalAmount > 0 && (
          <div className="flex justify-between font-subtitle font-semibold text-texto border-t border-blush/40 pt-3">
            <span>Total</span>
            <span className="text-rosa">{formatCurrency(totalAmount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-blush/40 pt-5">
        <DeliveryAddressForm
          address={address}
          onAddressChange={(patch) => setAddress((prev) => ({ ...prev, ...patch }))}
          delivery={delivery}
          onDeliveryChange={(patch) => setDelivery((prev) => ({ ...prev, ...patch }))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Criando...' : 'Criar pedido'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
