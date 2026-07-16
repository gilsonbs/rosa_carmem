import { Router } from 'express'
import { WebhookSignatureValidator } from 'mercadopago'
import { supabaseAdmin } from '../lib/supabase'
import { orderClient, paymentClient } from '../lib/mercadopago'
import { decrementStock } from '../lib/stock'
// restoreStock importado somente se necessário no futuro
import { logger } from '../lib/logger'

export const webhookRouter = Router()

const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET

interface OrderAddressMetadata {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
}

interface OrderMetadata {
  order_id?: string
  product_id?: string
  customer_id?: string
  delivery_date?: string
  delivery_time?: string
  address?: OrderAddressMetadata
}

/** Dados normalizados extraídos da notificação, independente de vir via Order ou Payment. */
interface ProviderPaymentInfo {
  providerPaymentId: string
  status: string | undefined
  amount: number | undefined
  externalReference: string | undefined
  metadata: OrderMetadata
}

function firstValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return firstValue(value[0])
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * Extrai os dados de pagamento a partir de uma notificação `type=order`
 * (evento "Order (Mercado Pago)" — o que este projeto usa hoje). A order
 * pode ter mais de um pagamento (ex.: uma tentativa recusada seguida de
 * uma aprovada); priorizamos o que estiver aprovado, senão pegamos o mais
 * recente.
 */
async function extractFromOrder(orderId: string): Promise<ProviderPaymentInfo> {
  const order = await orderClient.get({ id: orderId })
  const payments = order.transactions?.payments ?? []
  const payment = payments.find((p) => p.status === 'approved') ?? payments[payments.length - 1]

  return {
    providerPaymentId: payment?.id ?? orderId,
    status: payment?.status,
    amount: payment?.amount != null ? Number(payment.amount) : undefined,
    externalReference: order.external_reference,
    // A API de Orders não expõe metadata de volta — o fallback abaixo (que
    // depende dela) só se aplica de fato ao caminho legado via Payment.
    metadata: {},
  }
}

/** Extrai os dados a partir de uma notificação `type=payment` (formato legado, mantido por segurança). */
async function extractFromPayment(paymentId: string): Promise<ProviderPaymentInfo> {
  const payment = await paymentClient.get({ id: paymentId })
  const metadata = (payment.metadata ?? {}) as OrderMetadata

  return {
    providerPaymentId: String(payment.id ?? paymentId),
    status: payment.status,
    amount: payment.transaction_amount ?? undefined,
    externalReference: payment.external_reference ?? metadata.order_id,
    metadata,
  }
}

webhookRouter.post('/mercadopago', async (req, res) => {
  // b) Identifica o tipo ANTES de validar assinatura. O evento "Order
  // (Mercado Pago)" é o que este projeto está inscrito hoje — descobrimos
  // que o evento antigo "Pagamentos (legacy)" (escopo CheckoutTransparente)
  // nunca bateu a assinatura para pagamentos reais de Checkout Pro; ver
  // WEBHOOK_TROUBLESHOOTING.md. Mantemos suporte a `type=payment` também
  // por segurança, caso o Mercado Pago volte a mandar esse formato.
  // Notificações que não reconhecemos (ex.: `topic=merchant_order` do feed
  // legado) são aceitas e ignoradas (200) sem exigir assinatura, já que não
  // agimos sobre elas.
  const notificationType = req.body?.type ?? firstValue(req.query.type)
  const dataId = firstValue(req.query['data.id']) ?? firstValue(req.body?.data?.id)

  if ((notificationType !== 'order' && notificationType !== 'payment') || !dataId) {
    logger.ignored('unsupported notification format', {
      type: notificationType ?? 'none',
      topic: firstValue(req.query.topic) ?? 'none',
    })
    res.sendStatus(200)
    return
  }

  // a) Validação da assinatura — não processa nada se ela for inválida.
  if (!webhookSecret) {
    logger.error('webhook', new Error('MERCADOPAGO_WEBHOOK_SECRET não configurado no .env'))
    res.sendStatus(401)
    return
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId,
      secret: webhookSecret,
      // Nota: não usamos toleranceSeconds aqui. Nesta versão do SDK
      // (3.2.0) o valor de `ts` é comparado diretamente contra
      // Date.now() (milissegundos), mas o `ts` que o Mercado Pago envia
      // no header x-signature está em SEGUNDOS — isso faz o SDK rejeitar
      // até webhooks legítimos como "expirados". A verificação de HMAC
      // abaixo já garante a autenticidade da notificação.
    })
  } catch (error) {
    logger.error('webhook signature validation', error)
    res.sendStatus(401)
    return
  }

  try {
    // c) Busca os detalhes completos via SDK (Orders ou Payments, conforme o tipo).
    const info =
      notificationType === 'order' ? await extractFromOrder(dataId) : await extractFromPayment(dataId)

    logger.webhook(info.providerPaymentId, info.status ?? 'unknown')

    if (info.status !== 'approved') {
      res.sendStatus(200)
      return
    }

    const paymentIdStr = info.providerPaymentId

    // e) Idempotência: se este payment_id já gerou um pedido, ignora.
    const { data: existingByPaymentId } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('mercadopago_payment_id', paymentIdStr)
      .maybeSingle()

    if (existingByPaymentId) {
      logger.ignored('duplicate webhook', { payment_id: paymentIdStr })
      res.sendStatus(200)
      return
    }

    // d) Metadata salva na criação da preferência (usada apenas no fallback,
    // só disponível de fato quando a notificação veio via Payment).
    const metadata = info.metadata
    const orderId = info.externalReference ?? metadata.order_id

    let order: { id: string; product_id: string } | null = null

    if (orderId) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('id, product_id')
        .eq('id', orderId)
        .maybeSingle()
      order = data
    }

    let isNewOrder = false

    if (order) {
      // Caminho normal: a order já foi criada (pending) na criação da
      // preferência (server/routes/checkout.ts). Aqui só confirmamos o
      // pagamento nela — evita duplicar a mesma compra em duas linhas.
      // O histórico dessa mudança de status é gravado automaticamente pelo
      // trigger `trigger_order_status_change` (database/triggers.sql), não
      // precisamos inserir manualmente aqui.
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'approved',
          order_status: 'confirmed',
          mercadopago_payment_id: paymentIdStr,
          ...(info.amount != null ? { amount: info.amount } : {}),
        })
        .eq('id', order.id)

      if (updateError) throw updateError

      logger.orderUpdated(order.id, order.product_id)
    } else {
      // f.1) Fallback: nenhuma order pendente encontrada (ex.: preferência
      // criada fora do fluxo padrão). Cria a partir da metadata do pagamento.
      if (!metadata.product_id || !metadata.customer_id || !metadata.address) {
        logger.error(
          'webhook',
          new Error(`Pedido não encontrado para payment ${paymentIdStr} e metadata incompleta`),
        )
        res.sendStatus(200)
        return
      }

      const { data: newOrder, error: insertError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: metadata.customer_id,
          product_id: metadata.product_id,
          amount: info.amount ?? 0,
          payment_status: 'approved',
          order_status: 'confirmed',
          street: metadata.address.street,
          number: metadata.address.number,
          complement: metadata.address.complement || null,
          neighborhood: metadata.address.neighborhood,
          city: metadata.address.city,
          state: metadata.address.state,
          zip_code: metadata.address.zip_code,
          delivery_date: metadata.delivery_date,
          delivery_time: metadata.delivery_time,
          mercadopago_payment_id: paymentIdStr,
        })
        .select('id, product_id')
        .single()

      if (insertError || !newOrder) {
        throw insertError ?? new Error('Falha ao criar pedido a partir do webhook')
      }

      order = newOrder
      isNewOrder = true
      logger.orderCreated(order.id, order.product_id)
    }

    // f.2) Histórico de status. Só precisa do insert manual quando a order
    // acabou de ser criada (INSERT não dispara o trigger, que só escuta
    // AFTER UPDATE) — no caminho normal acima, o trigger já cuidou disso.
    if (isNewOrder) {
      const { error: historyError } = await supabaseAdmin
        .from('order_status_history')
        .insert({ order_id: order.id, status: 'confirmed' })

      if (historyError) throw historyError
    }

    // f.3-5) Baixa de estoque por item do pedido (suporte a múltiplos produtos).
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id)

    if (orderItems && orderItems.length > 0) {
      for (const oi of orderItems) {
        const stockResult = await decrementStock(oi.product_id, supabaseAdmin, oi.quantity)
        if (!stockResult.success) {
          logger.error('stock decrement', new Error(stockResult.error ?? 'erro desconhecido'))
        }
      }
    } else {
      // Fallback para pedidos antigos sem order_items
      const stockResult = await decrementStock(order.product_id, supabaseAdmin)
      if (!stockResult.success) {
        logger.error('stock decrement', new Error(stockResult.error ?? 'erro desconhecido'))
      }
    }

    // g) Sempre 200 para o Mercado Pago não retentar.
    res.sendStatus(200)
  } catch (error) {
    logger.error('webhook processing', error)
    res.sendStatus(200)
  }
})
