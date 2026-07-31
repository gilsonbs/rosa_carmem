import { useState } from 'react'
import toast from 'react-hot-toast'
import { createPaymentPreference } from '@/lib/mercadopago'
import { onlyDigits } from '@/utils/mask'
import type { CartItem } from '@/hooks/useCart'

export interface CustomerFormData {
  name: string
  email: string
  phone: string
}

export interface AddressFormData {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
}

export interface DeliveryFormData {
  date: string
  time: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DELIVERY_TIME_OPTIONS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']

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

export function useCheckout(cartItems: CartItem[]) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomer)
  const [address, setAddress] = useState<AddressFormData>(initialAddress)
  const [delivery, setDelivery] = useState<DeliveryFormData>(initialDelivery)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  function updateCustomer(patch: Partial<CustomerFormData>) {
    setCustomer((prev) => ({ ...prev, ...patch }))
  }

  function updateAddress(patch: Partial<AddressFormData>) {
    setAddress((prev) => ({ ...prev, ...patch }))
  }

  function updateDelivery(patch: Partial<DeliveryFormData>) {
    setDelivery((prev) => ({ ...prev, ...patch }))
  }

  function validateStep1(): boolean {
    if (!customer.name.trim()) {
      toast.error('Informe seu nome completo')
      return false
    }
    if (!EMAIL_REGEX.test(customer.email.trim())) {
      toast.error('Informe um e-mail válido')
      return false
    }
    if (onlyDigits(customer.phone).length < 10) {
      toast.error('Informe um telefone válido com DDD')
      return false
    }
    return true
  }

  function validateStep2(): boolean {
    if (onlyDigits(address.zip_code).length !== 8) {
      toast.error('Informe um CEP válido')
      return false
    }
    if (!address.street.trim() || !address.number.trim() || !address.neighborhood.trim()) {
      toast.error('Preencha o endereço completo')
      return false
    }
    if (!address.city.trim() || !address.state.trim()) {
      toast.error('Preencha cidade e estado')
      return false
    }
    if (!delivery.date) {
      toast.error('Selecione a data de entrega')
      return false
    }

    const [year, month, day] = delivery.date.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast.error('A data de entrega não pode ser no passado')
      return false
    }
    if (selectedDate.getDay() === 0) {
      toast.error('Não entregamos aos domingos, escolha outra data')
      return false
    }
    if (!DELIVERY_TIME_OPTIONS.includes(delivery.time)) {
      toast.error('Selecione um horário de entrega')
      return false
    }
    return true
  }

  function nextStep() {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  function prevStep() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2) : prev))
  }

  async function submitCheckout() {
    if (cartItems.length === 0) return

    setSubmitting(true)
    try {
      const { order_id, preference_id } = await createPaymentPreference({
        items: cartItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: onlyDigits(customer.phone),
        },
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

      setOrderId(order_id)
      setPreferenceId(preference_id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar pagamento'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    step,
    customer,
    address,
    delivery,
    submitting,
    orderId,
    preferenceId,
    updateCustomer,
    updateAddress,
    updateDelivery,
    nextStep,
    prevStep,
    submitCheckout,
  }
}
