/* =============================== order item ================================ */

export interface IOrderItem {
  product: string
  quantity: number
}

/* =============================== shipping address ================================ */

export interface IShippingAddress {
  name: string
  phone: string
  address: string
  city: string
}

/* =============================== create order payload ================================ */

export interface ICreateOrderPayload {
  orderId: string
  items: IOrderItem[]
  shippingAddress: IShippingAddress
}

/* =============================== order status ================================ */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
