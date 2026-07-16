import { MercadoPagoConfig, Order, Payment, Preference } from 'mercadopago'

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {
  throw new Error('Missing MERCADOPAGO_ACCESS_TOKEN in your .env file.')
}

export const mercadopagoConfig = new MercadoPagoConfig({ accessToken })

export const preferenceClient = new Preference(mercadopagoConfig)
export const paymentClient = new Payment(mercadopagoConfig)
export const orderClient = new Order(mercadopagoConfig)
