import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { preferenceClient } from '../lib/mercadopago'

export const checkoutRouter = Router()

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const apiUrl = process.env.API_URL ?? `http://localhost:${process.env.SERVER_PORT ?? 3001}`

interface CustomerInput {
  name: string
  email: string
  phone: string
}

interface AddressInput {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
}

interface CartItemInput {
  product_id: string
  quantity: number
}

interface CreatePreferenceBody {
  items: CartItemInput[]
  customer: CustomerInput
  address: AddressInput
  delivery_date: string
  delivery_time: string
}

function isValidBody(body: Partial<CreatePreferenceBody>): body is CreatePreferenceBody {
  return Boolean(
    Array.isArray(body.items) &&
      body.items.length > 0 &&
      body.items.every(
        (i) =>
          typeof i.product_id === 'string' &&
          i.product_id.length > 0 &&
          typeof i.quantity === 'number' &&
          i.quantity > 0,
      ) &&
      body.customer?.name &&
      body.customer?.email &&
      body.customer?.phone &&
      body.address?.street &&
      body.address?.number &&
      body.address?.neighborhood &&
      body.address?.city &&
      body.address?.state &&
      body.address?.zip_code &&
      body.delivery_date &&
      body.delivery_time,
  )
}

async function upsertCustomer(customer: CustomerInput) {
  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', customer.email)
    .maybeSingle()

  if (existing) {
    return supabaseAdmin
      .from('customers')
      .update({ name: customer.name, phone: customer.phone })
      .eq('id', existing.id)
      .select('id')
      .single()
  }

  return supabaseAdmin
    .from('customers')
    .insert({ name: customer.name, email: customer.email, phone: customer.phone })
    .select('id')
    .single()
}

checkoutRouter.post('/create-preference', async (req, res) => {
  const body = req.body as Partial<CreatePreferenceBody>

  if (!isValidBody(body)) {
    res.status(400).json({ error: 'Dados do pedido incompletos' })
    return
  }

  const { items: cartItems, customer, address, delivery_date, delivery_time } = body

  // Carrega e valida cada produto (active + stock)
  const productIds = [...new Set(cartItems.map((i) => i.product_id))]

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, active, stock')
    .in('id', productIds)

  if (productsError || !products) {
    res.status(500).json({ error: 'Erro ao buscar produtos' })
    return
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const cartItem of cartItems) {
    const product = productMap.get(cartItem.product_id)
    if (!product || !product.active) {
      res.status(404).json({ error: `Produto não encontrado ou indisponível` })
      return
    }

    const stock = (product as unknown as { stock: number }).stock
    if (stock < cartItem.quantity) {
      res.status(400).json({ error: `Produto "${product.name}" não tem estoque suficiente` })
      return
    }
  }

  const { data: customerRow, error: customerError } = await upsertCustomer(customer)

  if (customerError || !customerRow) {
    res.status(500).json({ error: 'Erro ao salvar dados do cliente' })
    return
  }

  // Produto principal = primeiro item (para product_id da tabela orders — compat. com dados antigos)
  const firstProduct = productMap.get(cartItems[0].product_id)!
  const totalAmount = cartItems.reduce(
    (sum, i) => sum + Number(productMap.get(i.product_id)!.price) * i.quantity,
    0,
  )

  const { data: orderRow, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerRow.id,
      product_id: firstProduct.id,
      amount: totalAmount,
      street: address.street,
      number: address.number,
      complement: address.complement || null,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      delivery_date,
      delivery_time,
    })
    .select('id')
    .single()

  if (orderError || !orderRow) {
    res.status(500).json({ error: 'Erro ao criar pedido' })
    return
  }

  // Salva os itens do pedido
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
    cartItems.map((i) => ({
      order_id: orderRow.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: Number(productMap.get(i.product_id)!.price),
    })),
  )

  if (itemsError) {
    res.status(500).json({ error: 'Erro ao salvar itens do pedido' })
    return
  }

  try {
    const preference = await preferenceClient.create({
      body: {
        items: cartItems.map((i) => {
          const p = productMap.get(i.product_id)!
          return {
            id: p.id,
            title: p.name,
            quantity: i.quantity,
            unit_price: Number(p.price),
            currency_id: 'BRL',
          }
        }),
        payer: {
          name: customer.name,
          email: customer.email,
          phone: { number: customer.phone },
        },
        back_urls: {
          success: `${frontendUrl}/checkout/success`,
          failure: `${frontendUrl}/checkout/failure`,
          pending: `${frontendUrl}/checkout/pending`,
        },
        ...(frontendUrl.startsWith('https://') ? { auto_return: 'approved' as const } : {}),
        notification_url: `${apiUrl}/api/webhook/mercadopago`,
        external_reference: orderRow.id,
        metadata: {
          order_id: orderRow.id,
          customer_id: customerRow.id,
          delivery_date,
          delivery_time,
          address,
        },
      },
    })

    await supabaseAdmin
      .from('orders')
      .update({ mercadopago_preference_id: preference.id })
      .eq('id', orderRow.id)

    res.json({
      preference_id: preference.id,
      init_point: preference.init_point,
    })
  } catch (mpError) {
    console.error('Erro ao criar preferência no Mercado Pago:', mpError)
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' })
  }
})

// Usada pela página /checkout/success para exibir os dados do pedido.
checkoutRouter.get('/order-by-payment', async (req, res) => {
  const paymentId = req.query.payment_id

  if (typeof paymentId !== 'string' || !paymentId) {
    res.status(400).json({ error: 'payment_id é obrigatório' })
    return
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      'id, order_status, delivery_date, delivery_time, street, number, complement, neighborhood, city, state, product:products(name)',
    )
    .eq('mercadopago_payment_id', paymentId)
    .maybeSingle()

  if (error || !order) {
    res.status(404).json({ error: 'Pedido não encontrado' })
    return
  }

  const product = order.product as unknown as { name: string } | null

  res.json({
    id: order.id,
    order_status: order.order_status,
    delivery_date: order.delivery_date,
    delivery_time: order.delivery_time?.slice(0, 5),
    street: order.street,
    number: order.number,
    complement: order.complement,
    neighborhood: order.neighborhood,
    city: order.city,
    state: order.state,
    product_name: product?.name ?? '',
  })
})
