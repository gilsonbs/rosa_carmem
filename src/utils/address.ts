import type { OrderWithRelations } from '@/types'

export function formatAddress(order: OrderWithRelations, includeZip = false): string {
  const complement = order.complement ? ` - ${order.complement}` : ''
  const zip = includeZip ? ` - ${order.zip_code}` : ''
  return `${order.street}, ${order.number}${complement} - ${order.neighborhood}, ${order.city}/${order.state}${zip}`
}

export function googleMapsSearchUrl(order: OrderWithRelations): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(order, true))}`
}
