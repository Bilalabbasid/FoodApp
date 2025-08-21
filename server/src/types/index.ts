export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roles: ('customer' | 'staff' | 'manager' | 'admin')[];
  hashedPassword: string;
  loyaltyPoints: number;
  addresses: Address[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
  isDefault: boolean;
}

export interface Store {
  _id: string;
  name: string;
  slug: string;
  address: Address;
  phone: string;
  email: string;
  hours: StoreHours[];
  isOpen: boolean;
  prepTimeMins: number;
  deliveryZones: DeliveryZone[];
  paymentConfig: PaymentConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
  isClosed: boolean;
}

export interface DeliveryZone {
  _id?: string;
  name: string;
  fee: number;
  minOrder: number;
  radius: number; // in miles/km
  center: {
    lat: number;
    lng: number;
  };
}

export interface PaymentConfig {
  stripeEnabled: boolean;
  cashEnabled: boolean;
  minOrderForDelivery: number;
  maxOrderValue: number;
}

export interface Category {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface Item {
  _id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  tags: string[];
  dietary: ('vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'spicy')[];
  isAvailable: boolean;
  variants: Variant[];
  addonGroups: AddonGroup[];
  prepTimeMinutes: number;
  calories?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Variant {
  _id?: string;
  name: string;
  priceDelta: number;
  sku?: string;
  isDefault: boolean;
}

export interface AddonGroup {
  _id?: string;
  name: string;
  min: number;
  max: number;
  addons: Addon[];
  isRequired: boolean;
}

export interface Addon {
  _id?: string;
  name: string;
  priceDelta: number;
  sku?: string;
  isAvailable: boolean;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  selectedVariant?: string;
  selectedAddons: string[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discounts: Discount[];
  taxes: Tax[];
  fees: Fee[];
  deliveryFee: number;
  tip: number;
  total: number;
  hash: string; // Security hash to prevent tampering
}

export interface Discount {
  type: 'coupon' | 'loyalty' | 'promotion';
  name: string;
  amount: number;
  code?: string;
}

export interface Tax {
  name: string;
  rate: number;
  amount: number;
}

export interface Fee {
  name: string;
  type: 'flat' | 'percentage';
  amount: number;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  startsAt: Date;
  endsAt: Date;
  uses: number;
  maxUses?: number;
  perUserLimit?: number;
  isActive: boolean;
  applicableStores: string[];
  applicableCategories: string[];
  createdAt: Date;
}

export interface Order {
  _id: string;
  orderNo: string;
  userId?: string;
  guestContact?: {
    name: string;
    email: string;
    phone: string;
  };
  storeId: string;
  items: OrderItem[];
  pricing: CartSummary;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: Address;
  deliveryInstructions?: string;
  scheduledFor?: Date;
  status: OrderStatus;
  payments: Payment[];
  timeline: OrderStatusUpdate[];
  notes?: string;
  assignedTo?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  selectedVariant?: {
    name: string;
    priceDelta: number;
  };
  selectedAddons: {
    name: string;
    priceDelta: number;
  }[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled'
  | 'refunded';

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface Payment {
  _id?: string;
  provider: 'stripe' | 'cash';
  intentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  refundAmount?: number;
  capturedAt?: Date;
  createdAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}