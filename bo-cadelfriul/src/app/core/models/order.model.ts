export interface OrderItem {
  id: string;
  lineTotal: number;
  priceAtPurchase: number;
  productId: string;
  productName: string;
  quantity: number;
}

export interface OrderItemSummary {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  lineTotal: number;
}

export interface AddressSummary {
  id: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  province: string;
  country: string;
  additionalInfo?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  shippingAddressId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerId: string;
  customerEmail: string;
  shippingAddress: AddressSummary | null;
  billingAddress: AddressSummary | null;
  items: OrderItemSummary[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
