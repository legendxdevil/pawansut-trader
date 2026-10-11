import type { OrderStatus, PaymentMethod, PaymentStatus, StatusHistoryEntry } from "@/lib/order-status";

export type { OrderStatus, PaymentMethod, PaymentStatus, StatusHistoryEntry };

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  size?: string;
  color?: string;
  stock: number;
  priceOverride?: number;
}

export interface ProductWarranty {
  enabled: boolean;
  months: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  category: string; // category slug
  tags: string[];
  price: number;
  mrp: number;
  specs: ProductSpec[];
  variants: ProductVariant[];
  warranty: ProductWarranty;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
}

export interface CustomerOrderDetails {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  pincode: string;
  email?: string;
}

export interface OrderItemWarranty {
  enabled: boolean;
  months: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number; // unit price snapshot
  qty: number;
  image?: string;
  warranty: OrderItemWarranty | null;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  gateway?: "cashfree";
  gatewayOrderId?: string;
  txnId?: string;
  paidAt?: number;
}

export interface WarrantyCard {
  number: string;
  productId: string;
  variantId: string;
  issuedAt: number;
}

export interface Order {
  id: string; // Firestore document ID
  orderId: string; // Human readable PT-000001
  customer: CustomerOrderDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode?: string;
  payment: OrderPayment;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  warrantyCards: WarrantyCard[];
  warrantyCardIssued: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerRecord {
  phone: string;
  name: string;
  lastAddress: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: number;
}

export interface Coupon {
  code: string; // uppercase ID
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  startsAt?: number;
  expiresAt?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Announcement {
  id: string;
  text: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  name: string;
  rating: number; // 1 to 5
  text: string;
  approved: boolean;
  createdAt: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  freeDeliveryAbove: number;
  deliveryCharge: number;
  restrictDeliveryToHospital: boolean;
  deliveryLocationName: string;
  storeName: string;
  supportEmail?: string;
  address?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
