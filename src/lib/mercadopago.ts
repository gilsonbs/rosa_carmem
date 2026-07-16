const mercadopagoPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY

if (!mercadopagoPublicKey) {
  throw new Error(
    'Missing Mercado Pago environment variable. Check VITE_MERCADOPAGO_PUBLIC_KEY in your .env file.',
  )
}

export const MERCADOPAGO_PUBLIC_KEY = mercadopagoPublicKey

export interface CartItemInput {
  product_id: string
  quantity: number
}

export interface CreatePreferenceInput {
  items: CartItemInput[]
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
  }
  delivery_date: string
  delivery_time: string
}

export interface CreatePreferenceResponse {
  preference_id: string
  init_point: string
}

export async function createPaymentPreference(
  input: CreatePreferenceInput,
): Promise<CreatePreferenceResponse> {
  const response = await fetch('/api/checkout/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? 'Falha ao criar preferência de pagamento no Mercado Pago')
  }

  return response.json()
}

export function redirectToCheckout(initPoint: string) {
  window.location.href = initPoint
}
