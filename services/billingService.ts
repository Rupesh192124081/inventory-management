/**
 * Billing Service - Production-Grade Invoice Management
 * 
 * Features:
 * - Purchase & Sale invoice creation
 * - Credit limit enforcement
 * - Auto invoice numbering
 * - Payment allocation
 * - Return handling
 */

import {
    SaleInvoice,
    PurchaseInvoice,
    ReturnInvoice,
    InvoiceItem,
    InvoiceSettings,
    Payment,
    DailySalesSummary,
    InvoiceStatus,
    PaymentMode
} from '../types/billing';
import { Party } from '../types/party';
import { inventoryService } from './inventoryService';

// Storage keys
const STORAGE_KEYS = {
    SALE_INVOICES: 'vyapar_sale_invoices',
    PURCHASE_INVOICES: 'vyapar_purchase_invoices',
    RETURN_INVOICES: 'vyapar_return_invoices',
    INVOICE_SETTINGS: 'vyapar_invoice_settings',
    PARTIES: 'vyapar_parties',
};

/**
 * Generate unique ID
 */
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current timestamp
 */
const now = (): string => new Date().toISOString();

/**
 * Default invoice settings
 */
const DEFAULT_SETTINGS: InvoiceSettings = {
    salePrefix: 'INV',
    saleNextNumber: 1,
    saleNumberFormat: '{PREFIX}-{YYYY}{MM}-{####}',
    purchasePrefix: 'PUR',
    purchaseNextNumber: 1,
    purchaseNumberFormat: '{PREFIX}-{YYYY}{MM}-{####}',
    returnPrefix: 'RET',
    returnNextNumber: 1,
    financialYearStart: '04-01', // April 1st India
    resetNumberOnNewYear: true,
};

/**
 * Billing Service Class
 */
class BillingService {

    // =====================
    // INVOICE SETTINGS
    // =====================

    /**
     * Get invoice settings
     */
    getSettings(): InvoiceSettings {
        const data = localStorage.getItem(STORAGE_KEYS.INVOICE_SETTINGS);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    }

    /**
     * Update invoice settings
     */
    updateSettings(settings: Partial<InvoiceSettings>): InvoiceSettings {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEYS.INVOICE_SETTINGS, JSON.stringify(updated));
        return updated;
    }

    /**
     * Generate invoice number
     */
    private generateInvoiceNumber(type: 'sale' | 'purchase' | 'return'): string {
        const settings = this.getSettings();
        const today = new Date();
        const year = today.getFullYear().toString();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');

        let prefix: string;
        let nextNumber: number;
        let format: string;

        if (type === 'sale') {
            prefix = settings.salePrefix || 'INV';
            nextNumber = settings.saleNextNumber || 1;
            format = settings.saleNumberFormat;
        } else if (type === 'purchase') {
            prefix = settings.purchasePrefix || 'PUR';
            nextNumber = settings.purchaseNextNumber || 1;
            format = settings.purchaseNumberFormat;
        } else {
            prefix = settings.returnPrefix || 'RET';
            nextNumber = settings.returnNextNumber || 1;
            format = '{PREFIX}-{YYYY}{MM}-{####}';
        }

        // Generate number
        const number = format
            .replace('{PREFIX}', prefix)
            .replace('{YYYY}', year)
            .replace('{YY}', year.slice(-2))
            .replace('{MM}', month)
            .replace('{####}', nextNumber.toString().padStart(4, '0'))
            .replace('{###}', nextNumber.toString().padStart(3, '0'));

        // Increment next number
        if (type === 'sale') {
            this.updateSettings({ saleNextNumber: nextNumber + 1 });
        } else if (type === 'purchase') {
            this.updateSettings({ purchaseNextNumber: nextNumber + 1 });
        } else {
            this.updateSettings({ returnNextNumber: nextNumber + 1 });
        }

        return number;
    }

    // =====================
    // SALE INVOICES
    // =====================

    /**
     * Get all sale invoices
     */
    getSaleInvoices(): SaleInvoice[] {
        const data = localStorage.getItem(STORAGE_KEYS.SALE_INVOICES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get sale invoice by ID
     */
    getSaleInvoice(id: string): SaleInvoice | null {
        const invoices = this.getSaleInvoices();
        return invoices.find(inv => inv.id === id) || null;
    }

    /**
     * Save sale invoices
     */
    private saveSaleInvoices(invoices: SaleInvoice[]): void {
        localStorage.setItem(STORAGE_KEYS.SALE_INVOICES, JSON.stringify(invoices));
    }

    /**
     * Get parties
     */
    private getParties(): Party[] {
        const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Update party balance
     */
    private updatePartyBalance(partyId: string, amount: number, isDebit: boolean): void {
        const parties = this.getParties();
        const partyIndex = parties.findIndex(p => p.id === partyId);

        if (partyIndex !== -1) {
            if (isDebit) {
                parties[partyIndex].currentBalance += amount;
            } else {
                parties[partyIndex].currentBalance -= amount;
            }
            localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
        }
    }

    /**
     * Validate credit limit
     */
    validateCreditLimit(partyId: string, invoiceAmount: number): {
        allowed: boolean;
        message: string;
        currentBalance: number;
        creditLimit: number;
    } {
        const parties = this.getParties();
        const party = parties.find(p => p.id === partyId);

        if (!party) {
            return { allowed: false, message: 'Party not found', currentBalance: 0, creditLimit: 0 };
        }

        if (party.creditBlocked) {
            return {
                allowed: false,
                message: 'Credit is blocked for this party',
                currentBalance: party.currentBalance,
                creditLimit: party.creditLimit
            };
        }

        const newBalance = party.currentBalance + invoiceAmount;

        if (party.creditLimit > 0 && newBalance > party.creditLimit) {
            return {
                allowed: false,
                message: `Credit limit exceeded. Limit: ₹${party.creditLimit}, Current: ₹${party.currentBalance}, New: ₹${newBalance}`,
                currentBalance: party.currentBalance,
                creditLimit: party.creditLimit
            };
        }

        return {
            allowed: true,
            message: 'Credit available',
            currentBalance: party.currentBalance,
            creditLimit: party.creditLimit
        };
    }

    /**
     * Create sale invoice (MAIN BILLING FUNCTION)
     */
    createSaleInvoice(params: {
        partyId: string;
        partyName: string;
        partyGstin?: string;
        partyPhone?: string;
        partyAddress?: string;
        partyStateCode?: string;
        items: InvoiceItem[];
        invoiceType: 'B2B' | 'B2C';
        placeOfSupply: string;
        paymentMode: PaymentMode;
        paidAmount: number;
        payments?: Payment[];
        shippingAddress?: string;
        shippingCharges?: number;
        notes?: string;
        termsAndConditions?: string;
        pointsRedeemed?: number;
        isOnlineOrder?: boolean;
        onlineOrderId?: string;
    }): { success: boolean; invoice?: SaleInvoice; error?: string } {

        const {
            partyId,
            partyName,
            items,
            paymentMode,
            paidAmount,
        } = params;

        // Check for credit sale
        if (paymentMode === 'credit') {
            const creditCheck = this.validateCreditLimit(partyId, this.calculateTotal(items));
            if (!creditCheck.allowed) {
                return { success: false, error: creditCheck.message };
            }
        }

        // Validate stock availability for all items
        for (const item of items) {
            const stockCheck = inventoryService.validateStockAvailability(
                item.itemId,
                item.quantity,
                item.variantId
            );
            if (!stockCheck.available) {
                return {
                    success: false,
                    error: `${item.name}: ${stockCheck.message}`
                };
            }
        }

        // Calculate totals
        const subTotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
        const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
        const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0);
        const cgstTotal = items.reduce((sum, item) => sum + item.cgst, 0);
        const sgstTotal = items.reduce((sum, item) => sum + item.sgst, 0);
        const igstTotal = items.reduce((sum, item) => sum + item.igst, 0);
        const cessTotal = items.reduce((sum, item) => sum + (item.cessAmount || 0), 0);
        const totalBeforeRound = taxableAmount + cgstTotal + sgstTotal + igstTotal + cessTotal + (params.shippingCharges || 0);
        const roundOff = Math.round(totalBeforeRound) - totalBeforeRound;
        const totalAmount = Math.round(totalBeforeRound);

        // Determine invoice status
        let status: InvoiceStatus;
        if (paidAmount >= totalAmount) {
            status = 'paid';
        } else if (paidAmount > 0) {
            status = 'partial';
        } else if (paymentMode === 'credit') {
            status = 'unpaid';
        } else {
            status = 'confirmed';
        }

        // Determine if interstate
        const businessStateCode = '27'; // Maharashtra - should come from profile
        const isInterstate = params.placeOfSupply !== businessStateCode;

        // Create invoice
        const invoice: SaleInvoice = {
            id: generateId(),
            invoiceNumber: this.generateInvoiceNumber('sale'),
            date: now(),
            type: 'sale',
            invoiceType: params.invoiceType,
            placeOfSupply: params.placeOfSupply,
            isInterstate,
            reverseCharge: false,

            partyId,
            partyName,
            partyGstin: params.partyGstin,
            partyPhone: params.partyPhone,
            partyAddress: params.partyAddress,
            partyStateCode: params.partyStateCode,

            items,

            subTotal,
            discountTotal,
            taxableAmount,
            cgstTotal,
            sgstTotal,
            igstTotal,
            cessTotal,
            roundOff,
            totalAmount,

            status,
            paymentMode,
            paidAmount,
            balanceAmount: totalAmount - paidAmount,
            payments: params.payments || [],

            shippingAddress: params.shippingAddress,
            shippingCharges: params.shippingCharges,

            notes: params.notes,
            termsAndConditions: params.termsAndConditions,

            pointsRedeemed: params.pointsRedeemed,
            pointsEarned: Math.floor(totalAmount / 100), // 1 point per ₹100

            onlineOrderId: params.onlineOrderId,

            createdAt: now(),
            updatedAt: now(),
        };

        // Deduct stock for all items
        for (const item of items) {
            const result = inventoryService.deductStock(
                item.itemId,
                item.quantity,
                invoice.id,
                invoice.invoiceNumber,
                item.variantId,
                partyId,
                partyName
            );

            if (!result.success) {
                // Rollback - in production, this should be transactional
                return { success: false, error: `Stock deduction failed: ${result.error}` };
            }
        }

        // Save invoice
        const invoices = this.getSaleInvoices();
        invoices.push(invoice);
        this.saveSaleInvoices(invoices);

        // Update party balance for credit sales
        if (paymentMode === 'credit' || status === 'partial' || status === 'unpaid') {
            this.updatePartyBalance(partyId, totalAmount - paidAmount, true);
        }

        return { success: true, invoice };
    }

    /**
     * Calculate invoice total from items
     */
    private calculateTotal(items: InvoiceItem[]): number {
        return items.reduce((sum, item) => sum + item.total, 0);
    }

    /**
     * Record payment for invoice
     */
    recordPayment(invoiceId: string, payment: Payment): { success: boolean; error?: string } {
        const invoices = this.getSaleInvoices();
        const index = invoices.findIndex(inv => inv.id === invoiceId);

        if (index === -1) {
            return { success: false, error: 'Invoice not found' };
        }

        const invoice = invoices[index];

        // Add payment
        invoice.payments.push(payment);
        invoice.paidAmount += payment.amount;
        invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

        // Update status
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'paid';
        } else if (invoice.paidAmount > 0) {
            invoice.status = 'partial';
        }

        invoice.updatedAt = now();

        invoices[index] = invoice;
        this.saveSaleInvoices(invoices);

        // Update party balance
        this.updatePartyBalance(invoice.partyId, payment.amount, false);

        return { success: true };
    }

    // =====================
    // PURCHASE INVOICES
    // =====================

    /**
     * Get all purchase invoices
     */
    getPurchaseInvoices(): PurchaseInvoice[] {
        const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_INVOICES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get purchase invoice by ID
     */
    getPurchaseInvoice(id: string): PurchaseInvoice | null {
        const invoices = this.getPurchaseInvoices();
        return invoices.find(inv => inv.id === id) || null;
    }

    /**
     * Save purchase invoices
     */
    private savePurchaseInvoices(invoices: PurchaseInvoice[]): void {
        localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(invoices));
    }

    /**
     * Create purchase invoice
     */
    createPurchaseInvoice(params: {
        supplierId: string;
        supplierName: string;
        supplierGstin?: string;
        supplierInvoiceNo: string;
        supplierInvoiceDate: string;
        dueDate: string;
        items: InvoiceItem[];
        paymentMode: PaymentMode;
        paidAmount: number;
        payments?: Payment[];
        freightCharges?: number;
        otherCharges?: number;
        notes?: string;
    }): { success: boolean; invoice?: PurchaseInvoice; error?: string } {

        const { items, paidAmount, paymentMode } = params;

        // Calculate totals
        const subTotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
        const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
        const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0);
        const cgstTotal = items.reduce((sum, item) => sum + item.cgst, 0);
        const sgstTotal = items.reduce((sum, item) => sum + item.sgst, 0);
        const igstTotal = items.reduce((sum, item) => sum + item.igst, 0);
        const cessTotal = items.reduce((sum, item) => sum + (item.cessAmount || 0), 0);
        const additionalCharges = (params.freightCharges || 0) + (params.otherCharges || 0);
        const totalBeforeRound = taxableAmount + cgstTotal + sgstTotal + igstTotal + cessTotal + additionalCharges;
        const roundOff = Math.round(totalBeforeRound) - totalBeforeRound;
        const totalAmount = Math.round(totalBeforeRound);

        // Determine status
        let status: InvoiceStatus;
        if (paidAmount >= totalAmount) {
            status = 'paid';
        } else if (paidAmount > 0) {
            status = 'partial';
        } else {
            status = 'unpaid';
        }

        // Create invoice
        const invoice: PurchaseInvoice = {
            id: generateId(),
            invoiceNumber: this.generateInvoiceNumber('purchase'),
            date: now(),
            type: 'purchase',

            partyId: params.supplierId,
            partyName: params.supplierName,
            partyGstin: params.supplierGstin,

            supplierInvoiceNo: params.supplierInvoiceNo,
            supplierInvoiceDate: params.supplierInvoiceDate,
            dueDate: params.dueDate,

            items,

            subTotal,
            discountTotal,
            taxableAmount,
            cgstTotal,
            sgstTotal,
            igstTotal,
            cessTotal,
            roundOff,
            totalAmount,

            freightCharges: params.freightCharges,
            otherCharges: params.otherCharges,

            status,
            paymentMode,
            paidAmount,
            balanceAmount: totalAmount - paidAmount,
            payments: params.payments || [],

            notes: params.notes,

            createdAt: now(),
            updatedAt: now(),
        };

        // Add stock for all items
        for (const item of items) {
            const result = inventoryService.addStock(
                item.itemId,
                item.quantity,
                item.rate,
                invoice.id,
                invoice.invoiceNumber,
                item.variantId,
                params.supplierId,
                params.supplierName
            );

            if (!result.success) {
                return { success: false, error: `Stock addition failed: ${result.error}` };
            }
        }

        // Save invoice
        const invoices = this.getPurchaseInvoices();
        invoices.push(invoice);
        this.savePurchaseInvoices(invoices);

        // Update supplier balance (payable)
        if (status === 'unpaid' || status === 'partial') {
            this.updatePartyBalance(params.supplierId, -(totalAmount - paidAmount), true);
        }

        return { success: true, invoice };
    }

    // =====================
    // REPORTING
    // =====================

    /**
     * Get daily sales summary
     */
    getDailySalesSummary(date?: string): DailySalesSummary {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const invoices = this.getSaleInvoices().filter(inv =>
            inv.date.startsWith(targetDate) && inv.status !== 'cancelled'
        );

        const returns = invoices.filter(inv => inv.type === 'sale' && inv.status === 'returned');
        const sales = invoices.filter(inv => inv.type === 'sale' && inv.status !== 'returned');

        const totalSales = sales.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalReturns = returns.reduce((sum, inv) => sum + inv.totalAmount, 0);

        const cashSales = sales
            .filter(inv => inv.paymentMode === 'cash')
            .reduce((sum, inv) => sum + inv.paidAmount, 0);

        const cardSales = sales
            .filter(inv => inv.paymentMode === 'card')
            .reduce((sum, inv) => sum + inv.paidAmount, 0);

        const upiSales = sales
            .filter(inv => inv.paymentMode === 'upi')
            .reduce((sum, inv) => sum + inv.paidAmount, 0);

        const creditSales = sales
            .filter(inv => inv.paymentMode === 'credit')
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

        // Get top selling items
        const itemSales: Record<string, { itemId: string; itemName: string; quantity: number; revenue: number }> = {};
        for (const inv of sales) {
            for (const item of inv.items) {
                if (!itemSales[item.itemId]) {
                    itemSales[item.itemId] = { itemId: item.itemId, itemName: item.name, quantity: 0, revenue: 0 };
                }
                itemSales[item.itemId].quantity += item.quantity;
                itemSales[item.itemId].revenue += item.total;
            }
        }

        const topSellingItems = Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        return {
            date: targetDate,
            totalSales,
            totalReturns,
            netSales: totalSales - totalReturns,
            cashSales,
            cardSales,
            upiSales,
            creditSales,
            invoiceCount: sales.length,
            returnCount: returns.length,
            cgstCollected: sales.reduce((sum, inv) => sum + inv.cgstTotal, 0),
            sgstCollected: sales.reduce((sum, inv) => sum + inv.sgstTotal, 0),
            igstCollected: sales.reduce((sum, inv) => sum + inv.igstTotal, 0),
            topSellingItems,
        };
    }

    /**
     * Get receivables summary
     */
    getReceivablesSummary(): { total: number; invoices: SaleInvoice[] } {
        const invoices = this.getSaleInvoices().filter(
            inv => inv.balanceAmount > 0 && inv.status !== 'cancelled'
        );

        const total = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

        return { total, invoices };
    }

    /**
     * Get payables summary
     */
    getPayablesSummary(): { total: number; invoices: PurchaseInvoice[] } {
        const invoices = this.getPurchaseInvoices().filter(
            inv => inv.balanceAmount > 0 && inv.status !== 'cancelled'
        );

        const total = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

        return { total, invoices };
    }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;
