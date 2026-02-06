
export type View = 'dashboard' | 'inventory' | 'billing' | 'parties' | 'invoices' | 'reports' | 'gst' | 'settings';

export interface BusinessProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

export interface ItemVariant {
  id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
}

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
}

export interface Party {
  id: string;
  name: string;
  type: 'customer' | 'vendor';
  gstin?: string;
  phone: string;
  balance: number;
  loyaltyPoints: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface InvoiceItem {
  itemId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
  discount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  partyId: string;
  date: string;
  type: 'sale' | 'purchase' | 'return';
  items: InvoiceItem[];
  subTotal: number;
  discountTotal: number;
  totalAmount: number;
  taxAmount: number;
  paymentMode: 'cash' | 'credit' | 'partial';
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  pointsEarned?: number;
}

export interface PaymentRecord {
  id: string;
  partyId: string;
  amount: number;
  date: string;
  mode: 'cash' | 'online' | 'cheque';
  note: string;
}
