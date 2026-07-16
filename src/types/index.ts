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
}
