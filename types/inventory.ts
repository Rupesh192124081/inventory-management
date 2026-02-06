// Enhanced Inventory Types for Production-Grade ERP

/**
 * Unit of measurement for items
 */
export type UnitType = 'pcs' | 'kg' | 'g' | 'l' | 'ml' | 'box' | 'pack' | 'dozen' | 'set' | 'meter' | 'sq.ft' | 'cu.ft';

/**
 * Stock valuation method
 */
export type ValuationMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVG';

/**
 * Stock movement type
 */
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE' | 'TRANSFER';

/**
 * Reference type for stock movements
 */
export type StockReferenceType = 'PURCHASE' | 'SALE' | 'MANUAL' | 'ONLINE_ORDER' | 'OPENING' | 'RETURN';

/**
 * Item variant with extended fields
 */
export interface ItemVariant {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    stock: number;
    purchasePrice: number;
    salePrice: number;
    minStock?: number;
    maxStock?: number;
    attributes?: Record<string, string>; // e.g., { color: 'Red', size: 'L' }
}

/**
 * Batch information for inventory items
 */
export interface Batch {
    id: string;
    batchNumber: string;
    manufacturingDate: string;
    expiryDate: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    supplierId?: string;
    purchaseInvoiceId?: string;
    status: 'active' | 'expired' | 'consumed';
}

/**
 * Enhanced Item type for production inventory
 */
export interface Item {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    hsnCode: string;
    description?: string;
    category: string;
    subCategory?: string;
    brand?: string;

    // Pricing
    purchasePrice: number;
    salePrice: number;
    mrp?: number; // Maximum Retail Price
    wholesalePrice?: number;

    // Stock
    stock: number;
    minStock: number;
    maxStock?: number;
    reorderLevel?: number;
    unit: UnitType | string;

    // Opening stock for new items
    openingStock: number;
    openingValue: number;
    openingDate?: string;

    // Taxation
    gstRate: number;
    cessRate?: number;
    hsnDescription?: string;

    // Valuation
    valuationMethod: ValuationMethod;
    currentValuation?: number; // Total value of stock
    averageCost?: number; // Weighted average cost

    // Variants & Batches
    hasVariants?: boolean;
    variants?: ItemVariant[];
    hasBatches?: boolean;
    batches?: Batch[];

    // Storefront fields
    imageUrl?: string;
    images?: string[];
    tags?: string[];
    featured?: boolean;
    newArrival?: boolean;
    onSale?: boolean;
    salePercentage?: number;

    // Metadata
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Stock Ledger Entry - Audit trail for all stock movements
 */
export interface StockLedgerEntry {
    id: string;
    itemId: string;
    variantId?: string;
    batchId?: string;

    date: string;
    type: StockMovementType;

    referenceType: StockReferenceType;
    referenceId: string;
    referenceNumber?: string; // Invoice number, PO number, etc.

    quantityIn: number;
    quantityOut: number;
    balanceAfter: number;

    rate: number; // Price per unit at transaction time
    value: number; // Total value of movement

    partyId?: string;
    partyName?: string;

    note?: string;
    userId?: string;
    userName?: string;

    createdAt: string;
}

/**
 * Stock Summary for reporting
 */
export interface StockSummary {
    itemId: string;
    itemName: string;
    sku: string;
    category: string;

    openingStock: number;
    openingValue: number;

    totalIn: number;
    totalInValue: number;

    totalOut: number;
    totalOutValue: number;

    closingStock: number;
    closingValue: number;

    averageCost: number;
    lastPurchasePrice: number;
    lastSalePrice: number;
}

/**
 * Low Stock Alert
 */
export interface LowStockAlert {
    itemId: string;
    itemName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    reorderLevel: number;
    unit: string;
    suggestedOrderQty: number;
    lastPurchaseDate?: string;
    preferredSupplierId?: string;
    preferredSupplierName?: string;
}

/**
 * Stock Aging Report Entry
 */
export interface StockAgingEntry {
    itemId: string;
    itemName: string;
    batchId?: string;
    batchNumber?: string;
    quantity: number;
    purchaseDate: string;
    ageInDays: number;
    expiryDate?: string;
    daysToExpiry?: number;
    value: number;
    status: 'good' | 'aging' | 'critical' | 'expired';
}
