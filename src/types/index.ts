export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  featured: boolean
  active: boolean
  stock: number
  /** @deprecated substituída por product_categories (database/categories.sql) */
  category: string | null
  /** IDs das categorias do produto (via product_categories). */
  category_ids?: string[]
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  display_order: number
  created_at: string
}

export interface ProductCategory {
  product_id: string
  category_id: string
}

export interface DeliveryZone {
  id: string
  municipality: string
  zone_name: string
  fee: number
  display_order: number
  active: boolean
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  product_id: string
  amount: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zip_code: string
  delivery_date: string | null
  delivery_time: string | null
  mercadopago_preference_id: string | null
  mercadopago_payment_id: string | null
  personal_message?: string | null
  delivery_zone_id?: string | null
  delivery_fee?: number | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  product: Product
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  changed_at: string
}

export interface Admin {
  id: string
  user_id: string
  name: string
  email: string
  created_at: string
}

export interface OrderWithRelations extends Order {
  customer: Customer
  product: Product
  items: OrderItem[]
  delivery_zone?: Pick<DeliveryZone, 'municipality' | 'zone_name'> | null
}
