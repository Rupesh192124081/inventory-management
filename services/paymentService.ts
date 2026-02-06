/**
 * Payment Service - Production-Grade Payment Management
 * 
 * Features:
 * - Payment recording (in/out)
 * - Payment allocation to invoices
 * - Outstanding tracking
 * - Aging analysis
 */

import {
    Party,
    PartyLedgerEntry,
    PaymentIn,
    PaymentOut,
    PaymentAllocation,
    OutstandingEntry,
    AgingSummary
} from '../types/party';
import { Payment, PaymentMode } from '../types/billing';

// Storage keys
const STORAGE_KEYS = {
    PARTIES: 'vyapar_parties',
    PAYMENTS_IN: 'vyapar_payments_in',
    PAYMENTS_OUT: 'vyapar_payments_out',
    PARTY_LEDGER: 'vyapar_party_ledger',
    SALE_INVOICES: 'vyapar_sale_invoices',
    PURCHASE_INVOICES: 'vyapar_purchase_invoices',
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
 * Payment Service Class
 */
class PaymentService {

    // =====================
    // PARTIES
    // =====================

    /**
     * Get all parties
     */
    getParties(): Party[] {
        const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get party by ID
     */
    getParty(id: string): Party | null {
        const parties = this.getParties();
        return parties.find(p => p.id === id) || null;
    }

    /**
     * Save parties
     */
    private saveParties(parties: Party[]): void {
        localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
    }

    /**
     * Update party balance
     */
    updatePartyBalance(partyId: string, amount: number, isIncrease: boolean): boolean {
        const parties = this.getParties();
        const index = parties.findIndex(p => p.id === partyId);

        if (index === -1) return false;

        if (isIncrease) {
            parties[index].currentBalance += amount;
        } else {
            parties[index].currentBalance -= amount;
        }

        this.saveParties(parties);
        return true;
    }

    // =====================
    // PAYMENTS IN (RECEIVED)
    // =====================

    /**
     * Get all payments received
     */
    getPaymentsIn(): PaymentIn[] {
        const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS_IN);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save payments in
     */
    private savePaymentsIn(payments: PaymentIn[]): void {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS_IN, JSON.stringify(payments));
    }

    /**
     * Record payment received from customer
     */
    recordPaymentIn(params: {
        partyId: string;
        partyName: string;
        amount: number;
        mode: PaymentMode;
        date?: string;
        referenceNo?: string;
        chequeNo?: string;
        chequeDate?: string;
        bankName?: string;
        upiId?: string;
        note?: string;
        allocations?: PaymentAllocation[];
        tdsAmount?: number;
        tdsRate?: number;
    }): { success: boolean; payment?: PaymentIn; error?: string } {

        const { partyId, partyName, amount, mode, allocations = [] } = params;

        // Calculate unallocated amount
        const allocatedAmount = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
        const unallocatedAmount = amount - allocatedAmount;

        // Create payment record
        const payment: PaymentIn = {
            id: generateId(),
            type: 'payment_in',
            partyId,
            partyName,
            date: params.date || now(),
            amount,
            mode,
            referenceNo: params.referenceNo,
            chequeNo: params.chequeNo,
            chequeDate: params.chequeDate,
            bankName: params.bankName,
            upiId: params.upiId,
            note: params.note,
            allocations,
            unallocatedAmount,
            tdsAmount: params.tdsAmount,
            tdsRate: params.tdsRate,
        };

        // Save payment
        const payments = this.getPaymentsIn();
        payments.push(payment);
        this.savePaymentsIn(payments);

        // Update party balance (reduce receivable)
        this.updatePartyBalance(partyId, amount, false);

        // Record in ledger
        this.recordLedgerEntry({
            partyId,
            type: 'payment',
            referenceType: 'payment_in',
            referenceId: payment.id,
            referenceNo: params.referenceNo || payment.id.slice(-8),
            credit: amount,
            narration: `Payment received - ${mode}`,
        });

        // Update invoice balances if allocations provided
        this.updateInvoiceBalances(allocations, 'sale');

        return { success: true, payment };
    }

    // =====================
    // PAYMENTS OUT (PAID)
    // =====================

    /**
     * Get all payments made
     */
    getPaymentsOut(): PaymentOut[] {
        const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS_OUT);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save payments out
     */
    private savePaymentsOut(payments: PaymentOut[]): void {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS_OUT, JSON.stringify(payments));
    }

    /**
     * Record payment made to supplier
     */
    recordPaymentOut(params: {
        partyId: string;
        partyName: string;
        amount: number;
        mode: PaymentMode;
        date?: string;
        referenceNo?: string;
        chequeNo?: string;
        chequeDate?: string;
        bankName?: string;
        note?: string;
        allocations?: PaymentAllocation[];
    }): { success: boolean; payment?: PaymentOut; error?: string } {

        const { partyId, partyName, amount, mode, allocations = [] } = params;

        // Calculate unallocated amount
        const allocatedAmount = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
        const unallocatedAmount = amount - allocatedAmount;

        // Create payment record
        const payment: PaymentOut = {
            id: generateId(),
            type: 'payment_out',
            partyId,
            partyName,
            date: params.date || now(),
            amount,
            mode,
            referenceNo: params.referenceNo,
            chequeNo: params.chequeNo,
            chequeDate: params.chequeDate,
            bankName: params.bankName,
            note: params.note,
            allocations,
            unallocatedAmount,
        };

        // Save payment
        const payments = this.getPaymentsOut();
        payments.push(payment);
        this.savePaymentsOut(payments);

        // Update party balance (reduce payable - increase balance)
        this.updatePartyBalance(partyId, amount, true);

        // Record in ledger
        this.recordLedgerEntry({
            partyId,
            type: 'payment',
            referenceType: 'payment_out',
            referenceId: payment.id,
            referenceNo: params.referenceNo || payment.id.slice(-8),
            debit: amount,
            narration: `Payment made - ${mode}`,
        });

        // Update invoice balances if allocations provided
        this.updateInvoiceBalances(allocations, 'purchase');

        return { success: true, payment };
    }

    // =====================
    // INVOICE BALANCE UPDATE
    // =====================

    /**
     * Update invoice balances after payment allocation
     */
    private updateInvoiceBalances(
        allocations: PaymentAllocation[],
        type: 'sale' | 'purchase'
    ): void {
        if (allocations.length === 0) return;

        const storageKey = type === 'sale'
            ? STORAGE_KEYS.SALE_INVOICES
            : STORAGE_KEYS.PURCHASE_INVOICES;

        const data = localStorage.getItem(storageKey);
        if (!data) return;

        const invoices = JSON.parse(data);

        for (const allocation of allocations) {
            const index = invoices.findIndex((inv: any) => inv.id === allocation.invoiceId);
            if (index !== -1) {
                invoices[index].paidAmount += allocation.allocatedAmount;
                invoices[index].balanceAmount = invoices[index].totalAmount - invoices[index].paidAmount;

                // Update status
                if (invoices[index].balanceAmount <= 0) {
                    invoices[index].status = 'paid';
                } else if (invoices[index].paidAmount > 0) {
                    invoices[index].status = 'partial';
                }
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(invoices));
    }

    // =====================
    // PARTY LEDGER
    // =====================

    /**
     * Get party ledger
     */
    getPartyLedger(partyId?: string): PartyLedgerEntry[] {
        const data = localStorage.getItem(STORAGE_KEYS.PARTY_LEDGER);
        const ledger: PartyLedgerEntry[] = data ? JSON.parse(data) : [];

        if (partyId) {
            return ledger.filter(e => e.partyId === partyId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return ledger;
    }

    /**
     * Record ledger entry
     */
    recordLedgerEntry(params: {
        partyId: string;
        type: 'invoice' | 'payment' | 'return' | 'adjustment' | 'opening';
        referenceType: 'sale' | 'purchase' | 'return' | 'payment_in' | 'payment_out' | 'adjustment';
        referenceId: string;
        referenceNo: string;
        debit?: number;
        credit?: number;
        dueDate?: string;
        narration?: string;
    }): PartyLedgerEntry {
        const ledger = this.getPartyLedger();

        // Get last balance for this party
        const partyLedger = ledger.filter(e => e.partyId === params.partyId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const lastBalance = partyLedger.length > 0
            ? partyLedger[partyLedger.length - 1].balance
            : 0;

        // Calculate new balance
        const debit = params.debit || 0;
        const credit = params.credit || 0;
        const balance = lastBalance + debit - credit;

        const entry: PartyLedgerEntry = {
            id: generateId(),
            partyId: params.partyId,
            date: now(),
            type: params.type,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            referenceNo: params.referenceNo,
            debit,
            credit,
            balance,
            dueDate: params.dueDate,
            narration: params.narration,
            createdAt: now(),
        };

        ledger.push(entry);
        localStorage.setItem(STORAGE_KEYS.PARTY_LEDGER, JSON.stringify(ledger));

        return entry;
    }

    // =====================
    // OUTSTANDING & AGING
    // =====================

    /**
     * Get outstanding receivables
     */
    getOutstandingReceivables(): OutstandingEntry[] {
        const data = localStorage.getItem(STORAGE_KEYS.SALE_INVOICES);
        const invoices = data ? JSON.parse(data) : [];
        const parties = this.getParties().filter(p => p.type === 'customer' || p.type === 'both');

        const outstanding: OutstandingEntry[] = [];
        const today = new Date();

        for (const party of parties) {
            const partyInvoices = invoices.filter((inv: any) =>
                inv.partyId === party.id &&
                inv.balanceAmount > 0 &&
                inv.status !== 'cancelled'
            );

            if (partyInvoices.length === 0) continue;

            const entry: OutstandingEntry = {
                partyId: party.id,
                partyName: party.name,
                partyPhone: party.phone,
                invoices: [],
                totalOutstanding: 0,
                currentDue: 0,
                overdue30: 0,
                overdue60: 0,
                overdue90Plus: 0,
            };

            for (const inv of partyInvoices) {
                const dueDate = new Date(inv.dueDate || inv.date);
                const ageInDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                let bucket: '0-30' | '31-60' | '61-90' | '90+';
                if (ageInDays <= 30) {
                    bucket = '0-30';
                    entry.currentDue += inv.balanceAmount;
                } else if (ageInDays <= 60) {
                    bucket = '31-60';
                    entry.overdue30 += inv.balanceAmount;
                } else if (ageInDays <= 90) {
                    bucket = '61-90';
                    entry.overdue60 += inv.balanceAmount;
                } else {
                    bucket = '90+';
                    entry.overdue90Plus += inv.balanceAmount;
                }

                entry.invoices.push({
                    invoiceId: inv.id,
                    invoiceNo: inv.invoiceNumber,
                    invoiceDate: inv.date,
                    dueDate: inv.dueDate || inv.date,
                    totalAmount: inv.totalAmount,
                    paidAmount: inv.paidAmount,
                    balanceAmount: inv.balanceAmount,
                    ageInDays,
                    bucket,
                });

                entry.totalOutstanding += inv.balanceAmount;
            }

            outstanding.push(entry);
        }

        return outstanding.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
    }

    /**
     * Get outstanding payables
     */
    getOutstandingPayables(): OutstandingEntry[] {
        const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_INVOICES);
        const invoices = data ? JSON.parse(data) : [];
        const parties = this.getParties().filter(p => p.type === 'supplier' || p.type === 'both');

        const outstanding: OutstandingEntry[] = [];
        const today = new Date();

        for (const party of parties) {
            const partyInvoices = invoices.filter((inv: any) =>
                inv.partyId === party.id &&
                inv.balanceAmount > 0 &&
                inv.status !== 'cancelled'
            );

            if (partyInvoices.length === 0) continue;

            const entry: OutstandingEntry = {
                partyId: party.id,
                partyName: party.name,
                partyPhone: party.phone,
                invoices: [],
                totalOutstanding: 0,
                currentDue: 0,
                overdue30: 0,
                overdue60: 0,
                overdue90Plus: 0,
            };

            for (const inv of partyInvoices) {
                const dueDate = new Date(inv.dueDate || inv.date);
                const ageInDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                let bucket: '0-30' | '31-60' | '61-90' | '90+';
                if (ageInDays <= 30) {
                    bucket = '0-30';
                    entry.currentDue += inv.balanceAmount;
                } else if (ageInDays <= 60) {
                    bucket = '31-60';
                    entry.overdue30 += inv.balanceAmount;
                } else if (ageInDays <= 90) {
                    bucket = '61-90';
                    entry.overdue60 += inv.balanceAmount;
                } else {
                    bucket = '90+';
                    entry.overdue90Plus += inv.balanceAmount;
                }

                entry.invoices.push({
                    invoiceId: inv.id,
                    invoiceNo: inv.invoiceNumber,
                    invoiceDate: inv.date,
                    dueDate: inv.dueDate || inv.date,
                    totalAmount: inv.totalAmount,
                    paidAmount: inv.paidAmount,
                    balanceAmount: inv.balanceAmount,
                    ageInDays,
                    bucket,
                });

                entry.totalOutstanding += inv.balanceAmount;
            }

            outstanding.push(entry);
        }

        return outstanding.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
    }

    /**
     * Get aging summary
     */
    getAgingSummary(type: 'receivables' | 'payables'): AgingSummary[] {
        const outstanding = type === 'receivables'
            ? this.getOutstandingReceivables()
            : this.getOutstandingPayables();

        return outstanding.map(o => ({
            partyId: o.partyId,
            partyName: o.partyName,
            current: o.currentDue,
            days30: o.overdue30,
            days60: o.overdue60,
            days90: 0,
            days90Plus: o.overdue90Plus,
            total: o.totalOutstanding,
        }));
    }

    // =====================
    // SUMMARY
    // =====================

    /**
     * Get total receivables
     */
    getTotalReceivables(): number {
        return this.getOutstandingReceivables()
            .reduce((sum, o) => sum + o.totalOutstanding, 0);
    }

    /**
     * Get total payables
     */
    getTotalPayables(): number {
        return this.getOutstandingPayables()
            .reduce((sum, o) => sum + o.totalOutstanding, 0);
    }

    /**
     * Get payments summary for period
     */
    getPaymentsSummary(startDate: string, endDate: string): {
        totalReceived: number;
        totalPaid: number;
        receivedByMode: Record<string, number>;
        paidByMode: Record<string, number>;
    } {
        const paymentsIn = this.getPaymentsIn().filter(p => {
            const pDate = new Date(p.date);
            return pDate >= new Date(startDate) && pDate <= new Date(endDate);
        });

        const paymentsOut = this.getPaymentsOut().filter(p => {
            const pDate = new Date(p.date);
            return pDate >= new Date(startDate) && pDate <= new Date(endDate);
        });

        const receivedByMode: Record<string, number> = {};
        for (const p of paymentsIn) {
            receivedByMode[p.mode] = (receivedByMode[p.mode] || 0) + p.amount;
        }

        const paidByMode: Record<string, number> = {};
        for (const p of paymentsOut) {
            paidByMode[p.mode] = (paidByMode[p.mode] || 0) + p.amount;
        }

        return {
            totalReceived: paymentsIn.reduce((sum, p) => sum + p.amount, 0),
            totalPaid: paymentsOut.reduce((sum, p) => sum + p.amount, 0),
            receivedByMode,
            paidByMode,
        };
    }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
