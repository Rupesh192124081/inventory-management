// Billing Types for Production-Grade ERP

import { Item, ItemVariant } from './inventory';

/**
 * Payment modes
 */
export type PaymentMode = 'cash' | 'upi' | 'card' | 'cheque' | 'neft' | 'rtgs' | 'credit' | 'wallet';

/**
 * Invoice status
 */
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partial' | 'unpaid' | 'cancelled' | 'returned';

/**
 * Invoice type for GST classification
 */
export type InvoiceType = 'B2B' | 'B2C' | 'B2B_LARGE' | 'EXPORT' | 'SEZ';

/**
 * Transport mode for E-Way Bill
 */
export type TransportMode = 'road' | 'rail' | 'air' | 'ship';

/**
 * Individual payment entry
 */
export interface Payment {
    id: string;
    date: string;
    amount: number;
    mode: PaymentMode;
    referenceNo?: string;
    chequeNo?: string;
    chequeDate?: string;
    bankName?: string;
    upiId?: string;
    note?: string;
}

/**
 * Transport details for E-Way Bill
 */
export interface TransportDetails {
    transporterId?: string;
    transporterName?: string;
    transportMode: TransportMode;
    vehicleNo?: string;
    vehicleType?: 'regular' | 'over_dimensional';
    distance?: number; // in km
    transDocNo?: string; // Transport document number
    transDocDate?: string;
}

/**
 * Invoice item - common for purchase and sale
 */
export interface InvoiceItem {
    id: string;
    itemId: string;
    variantId?: string;
    batchId?: string;

    name: string;
    sku: string;
    hsnCode: string;

    quantity: number;
    freeQuantity?: number; // Free items in schemes
    unit: string;

    rate: number; // Price per unit before discount
    discount: number; // Amount
    discountPercent?: number;

    taxableAmount: number;

    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    cessRate?: number;
    cessAmount?: number;

    total: number;

    // For linking back to inventory
    itemRef?: Item;
    variantRef?: ItemVariant;
}

/**
 * Base invoice fields
 */
interface BaseInvoice {
    id: string;
    invoiceNumber: string;
    date: string;

    partyId: string;
    partyName: string;
    partyGstin?: string;
    partyPhone?: string;
    partyAddress?: string;
    partyStateCode?: string;

    items: InvoiceItem[];

    subTotal: number;
    discountTotal: number;
    taxableAmount: number;

    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    cessTotal: number;

    roundOff: number;
    totalAmount: number;

    status: InvoiceStatus;
    paymentMode: PaymentMode;
    paidAmount: number;
    balanceAmount: number;
    payments: Payment[];

    notes?: string;
    termsAndConditions?: string;

    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

/**
 * Purchase Invoice
 */
export interface PurchaseInvoice extends BaseInvoice {
    type: 'purchase';

    // Supplier's original invoice reference
    supplierInvoiceNo: string;
    supplierInvoiceDate: string;

    dueDate: string;

    // Additional charges
    freightCharges?: number;
    otherCharges?: number;

    // E-Way Bill
    eWayBillNo?: string;
    eWayBillDate?: string;
    transportDetails?: TransportDetails;

    // PO reference
    purchaseOrderId?: string;
    purchaseOrderNo?: string;

    // GRN reference
    grnId?: string;
    grnNo?: string;
}

/**
 * Sale Invoice
 */
export interface SaleInvoice extends BaseInvoice {
    type: 'sale';

    // GST Classification
    invoiceType: InvoiceType;
    placeOfSupply: string; // State code
    isInterstate: boolean;
    reverseCharge: boolean;

    dueDate?: string;

    // Shipping
    shippingAddress?: string;
    shippingCharges?: number;

    // E-Invoice
    eInvoiceNo?: string;
    irn?: string; // Invoice Reference Number
    ackNo?: string; // Acknowledgement Number
    ackDate?: string;
    signedInvoice?: string;
    signedQRCode?: string;

    // E-Way Bill
    eWayBillNo?: string;
    eWayBillDate?: string;
    transportDetails?: TransportDetails;

    // Loyalty
    pointsEarned?: number;
    pointsRedeemed?: number;
    pointsValue?: number;

    // For online orders
    onlineOrderId?: string;

    // Customer signature (for POS)
    customerSignature?: string;
}

/**
 * Return/Credit Note
 */
export interface ReturnInvoice extends BaseInvoice {
    type: 'return';

    originalInvoiceId: string;
    originalInvoiceNo: string;
    originalInvoiceDate: string;

    returnType: 'full' | 'partial';
    returnReason: string;

    refundMode?: PaymentMode;
    refundStatus?: 'pending' | 'processed';
}

/**
 * Invoice settings for auto-numbering
 */
export interface InvoiceSettings {
    salePrefix: string;
    saleSuffix?: string;
    saleNextNumber: number;
    saleNumberFormat: string; // e.g., "INV-{YYYY}-{MM}-{####}"

    purchasePrefix: string;
    purchaseSuffix?: string;
    purchaseNextNumber: number;
    purchaseNumberFormat: string;

    returnPrefix: string;
    returnSuffix?: string;
    returnNextNumber: number;

    financialYearStart: string; // MM-DD format
    resetNumberOnNewYear: boolean;
}

/**
 * Daily sales summary
 */
export interface DailySalesSummary {
    date: string;
    totalSales: number;
    totalReturns: number;
    netSales: number;

    cashSales: number;
    cardSales: number;
    upiSales: number;
    creditSales: number;

    invoiceCount: number;
    returnCount: number;

    cgstCollected: number;
    sgstCollected: number;
    igstCollected: number;

    topSellingItems: Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        revenue: number;
    }>;
}
