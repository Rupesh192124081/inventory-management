// Party (Customer/Supplier) Types for Production-Grade ERP

import { Payment } from './billing';

/**
 * Party type
 */
export type PartyType = 'customer' | 'supplier' | 'both';

/**
 * GST registration type
 */
export type GstRegistrationType = 'regular' | 'composition' | 'unregistered' | 'consumer' | 'overseas';

/**
 * Address type
 */
export interface Address {
    id: string;
    type: 'billing' | 'shipping' | 'both';
    label?: string; // e.g., "Head Office", "Warehouse"
    street: string;
    landmark?: string;
    city: string;
    state: string;
    stateCode: string; // GST state code (01-37)
    pincode: string;
    country: string;
    isDefault: boolean;
}

/**
 * Contact person
 */
export interface ContactPerson {
    id: string;
    name: string;
    designation?: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
}

/**
 * Enhanced Party type
 */
export interface Party {
    id: string;
    name: string;
    tradeName?: string; // Legal trade name
    type: PartyType;

    // Contact
    phone: string;
    alternatePhone?: string;
    email?: string;
    website?: string;

    // GST Details
    gstin?: string;
    pan?: string;
    gstRegistrationType: GstRegistrationType;
    stateCode: string;

    // Addresses
    addresses: Address[];
    billingAddress?: Address;
    shippingAddress?: Address;

    // Contact persons
    contactPersons?: ContactPerson[];

    // Credit Management (for customers)
    creditLimit: number;
    creditDays: number;
    creditBlocked: boolean;

    // Financial
    openingBalance: number;
    openingBalanceDate?: string;
    currentBalance: number; // Positive = receivable, Negative = payable
    totalReceivable: number;
    totalPayable: number;

    // Loyalty (for customers)
    loyaltyPoints: number;
    loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';

    // Communication preferences
    whatsappOptIn: boolean;
    whatsappNumber?: string;
    emailNotifications: boolean;

    // Pricing
    defaultPriceList?: string;
    discountPercent?: number;

    // For suppliers
    paymentTerms?: string;
    bankDetails?: BankDetails;

    // Metadata
    tags?: string[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Bank details for payments
 */
export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName?: string;
    ifscCode: string;
    upiId?: string;
}

/**
 * Party ledger entry
 */
export interface PartyLedgerEntry {
    id: string;
    partyId: string;
    date: string;

    type: 'invoice' | 'payment' | 'return' | 'adjustment' | 'opening';
    referenceType: 'sale' | 'purchase' | 'return' | 'payment_in' | 'payment_out' | 'adjustment';
    referenceId: string;
    referenceNo: string;

    debit: number; // Amount owed by party (receivable)
    credit: number; // Amount owed to party (payable)
    balance: number;

    dueDate?: string;
    narration?: string;

    createdAt: string;
}

/**
 * Payment received from customer
 */
export interface PaymentIn extends Payment {
    type: 'payment_in';
    partyId: string;
    partyName: string;

    // Allocation to invoices
    allocations: PaymentAllocation[];
    unallocatedAmount: number;

    // For TDS deduction
    tdsAmount?: number;
    tdsRate?: number;
}

/**
 * Payment made to supplier
 */
export interface PaymentOut extends Payment {
    type: 'payment_out';
    partyId: string;
    partyName: string;

    // Allocation to invoices
    allocations: PaymentAllocation[];
    unallocatedAmount: number;
}

/**
 * Payment allocation to specific invoice
 */
export interface PaymentAllocation {
    invoiceId: string;
    invoiceNo: string;
    invoiceDate: string;
    invoiceAmount: number;
    allocatedAmount: number;
    balanceAfter: number;
}

/**
 * Outstanding report entry
 */
export interface OutstandingEntry {
    partyId: string;
    partyName: string;
    partyPhone: string;

    invoices: Array<{
        invoiceId: string;
        invoiceNo: string;
        invoiceDate: string;
        dueDate: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        ageInDays: number;
        bucket: '0-30' | '31-60' | '61-90' | '90+';
    }>;

    totalOutstanding: number;
    currentDue: number;  // 0-30 days
    overdue30: number;   // 31-60 days
    overdue60: number;   // 61-90 days
    overdue90Plus: number; // 90+ days
}

/**
 * Aging summary
 */
export interface AgingSummary {
    partyId: string;
    partyName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days90Plus: number;
    total: number;
}
