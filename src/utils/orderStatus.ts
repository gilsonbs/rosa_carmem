import type { Tone } from '@/components/ui/Badge'
import type { OrderStatus, PaymentStatus } from '@/types'

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Novo',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  new: 'neutral',
  confirmed: 'rosa',
  preparing: 'dourado',
  out_for_delivery: 'dourado',
  delivered: 'success',
  cancelled: 'danger',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
  refunded: 'Reembolsado',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  pending: 'neutral',
  approved: 'success',
  rejected: 'danger',
  refunded: 'dourado',
}

/** Origem do pedido: pago pelo Mercado Pago vs. criado manualmente pelo admin (ex.: WhatsApp). */
export function getOrderSourceLabel(order: { mercadopago_payment_id: string | null }): string {
  return order.mercadopago_payment_id ? 'Mercado Pago' : 'Pedido Manual'
}

export function getOrderSourceTone(order: { mercadopago_payment_id: string | null }): Tone {
  return order.mercadopago_payment_id ? 'neutral' : 'dourado'
}
