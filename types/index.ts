// Unified exports for all types
// Production-Grade Distributor ERP

// Inventory types
export * from './inventory';

// Billing types
export * from './billing';

// Party types
export * from './party';

// GST types
export * from './gst';

// ============================================
// Additional shared types
// ============================================

/**
 * App views for navigation
 */
export type View =
    | 'dashboard'
    | 'inventory'
    | 'billing'
    | 'purchases'
    | 'parties'
    | 'invoices'
    | 'payments'
    | 'stock-ledger'
    | 'reports'
    | 'gst'
    | 'settings';

/**
 * Business profile
 */
export interface BusinessProfile {
    id: string;
    name: string;
    tradeName?: string;
    tagline?: string;
    logo?: string;

    // Address
    address: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;

    // Contact
    phone: string;
    alternatePhone?: string;
    email?: string;
    website?: string;

    // GST & Legal
    gstin: string;
    pan?: string;
    cin?: string;
    fssaiNo?: string;
    drugLicenseNo?: string;

    // Bank details
    bankName?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
    upiId?: string;

    // Settings
    currency: string;
    currencySymbol: string;
    financialYearStart: string; // MM-DD

    // Invoice settings
    invoicePrefix?: string;
    invoiceTerms?: string;
    signatureImage?: string;

    createdAt: string;
    updatedAt: string;
}

/**
 * App notification
 */
export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    category: 'stock' | 'payment' | 'order' | 'system';
    date: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

/**
 * User role
 */
export type UserRole = 'admin' | 'manager' | 'staff' | 'accountant' | 'viewer';

/**
 * User
 */
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;

    permissions: string[];

    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

/**
 * Expense category
 */
export interface ExpenseCategory {
    id: string;
    name: string;
    description?: string;
    budgetLimit?: number;
}

/**
 * Expense
 */
export interface Expense {
    id: string;
    categoryId: string;
    category: string;
    amount: number;
    date: string;

    paymentMode: 'cash' | 'bank' | 'upi' | 'card';
    referenceNo?: string;

    partyId?: string;
    partyName?: string;

    note: string;
    receiptUrl?: string;

    isGstApplicable: boolean;
    gstRate?: number;
    gstAmount?: number;

    createdBy?: string;
    createdAt: string;
}

/**
 * Audit log entry
 */
export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;

    changes?: Record<string, { old: any; new: any }>;

    userId: string;
    userName: string;
    userIp?: string;

    timestamp: string;
}

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
    // Sales
    todaySales: number;
    weekSales: number;
    monthSales: number;

    // Purchases
    monthPurchases: number;

    // Outstanding
    totalReceivables: number;
    totalPayables: number;

    // Stock
    totalStockValue: number;
    lowStockItemsCount: number;

    // Today's summary
    todayInvoiceCount: number;
    todayCashCollection: number;
    todayExpenses: number;

    // Trends
    salesTrend: Array<{ date: string; amount: number }>;
    categorySales: Array<{ category: string; amount: number }>;
    paymentModeBreakdown: Array<{ mode: string; amount: number }>;
}
