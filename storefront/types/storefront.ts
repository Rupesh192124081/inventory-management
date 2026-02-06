// Shared type definitions for storefront
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  addresses: Address[];
  wishlist: string[];
  loyaltyPoints: number;
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CartItem {
  itemId: string;
  variantId?: string;
  quantity: number;
  addedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface OrderItem {
  itemId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

// Re-export types from admin
// Product type (alias for Item for storefront compatibility)
export type Product = Item;

export interface Item {
  id: string;
  name: string;
  hsnCode: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  gstRate: number;
  variants?: ItemVariant[];
  category?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  featured?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  salePercentage?: number;
}

export interface ItemVariant {
  id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
}
