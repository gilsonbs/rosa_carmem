function timestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function line(label: string, fields: Record<string, string | number>) {
  const parts = Object.entries(fields).map(([key, value]) => `${key}: ${value}`)
  console.log(`[${timestamp()}] ${label} | ${parts.join(' | ')}`)
}

export const logger = {
  webhook(paymentId: string | number, status: string) {
    line('WEBHOOK', { payment_id: paymentId, status })
  },
  ignored(reason: string, details: Record<string, string | number> = {}) {
    line('WEBHOOK IGNORED', { reason, ...details })
  },
  orderCreated(orderId: string, product: string) {
    line('ORDER CREATED', { order_id: orderId, product })
  },
  orderUpdated(orderId: string, product: string) {
    line('ORDER UPDATED', { order_id: orderId, product })
  },
  stockDecremented(productId: string, itemsUpdated: number) {
    line('STOCK DECREMENTED', { product_id: productId, 'items updated': itemsUpdated })
  },
  productDisabled(productId: string, reason: string) {
    line('PRODUCT DISABLED', { product_id: productId, reason })
  },
  error(context: string, error: unknown) {
    if (error instanceof Error) {
      console.error(`[${timestamp()}] ERROR | context: ${context} | message: ${error.message}`)
      if (error.stack) console.error(error.stack)
      return
    }

    // SDKs como o do Mercado Pago às vezes rejeitam com objetos simples
    // (não instâncias de Error) — logamos a estrutura completa em vez de
    // deixar virar "[object Object]".
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : JSON.stringify(error)
    console.error(`[${timestamp()}] ERROR | context: ${context} | message: ${message}`)
    console.error(error)
  },
}
