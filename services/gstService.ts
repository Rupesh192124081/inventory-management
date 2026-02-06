/**
 * GST Service - Production-Grade GST Compliance
 * 
 * Features:
 * - CGST/SGST/IGST calculation
 * - HSN-wise tax summary
 * - GSTR-1 data preparation
 * - GSTR-3B summary
 * - E-Invoice structure generation
 */

import {
    STATE_CODES,
    Gstr1Return,
    Gstr1B2bInvoice,
    Gstr1B2csSummary,
    Gstr1HsnSummary,
    Gstr3bSummary,
    EInvoiceRequest,
    EWayBillRequest,
} from '../types/gst';
import { SaleInvoice, PurchaseInvoice, InvoiceItem } from '../types/billing';
import { BusinessProfile } from '../types';

// Storage keys
const STORAGE_KEYS = {
    SALE_INVOICES: 'vyapar_sale_invoices',
    PURCHASE_INVOICES: 'vyapar_purchase_invoices',
    PROFILE: 'vyapar_profile',
};

/**
 * GST Service Class
 */
class GstService {

    // =====================
    // HELPERS
    // =====================

    /**
     * Get business profile
     */
    private getProfile(): BusinessProfile | null {
        const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Get sale invoices
     */
    private getSaleInvoices(): SaleInvoice[] {
        const data = localStorage.getItem(STORAGE_KEYS.SALE_INVOICES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get purchase invoices
     */
    private getPurchaseInvoices(): PurchaseInvoice[] {
        const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_INVOICES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get state name from code
     */
    getStateName(code: string): string {
        return STATE_CODES[code] || 'Unknown';
    }

    // =====================
    // TAX CALCULATION
    // =====================

    /**
     * Calculate tax for invoice item
     * @param taxableAmount - Amount after discount
     * @param gstRate - GST rate (0, 5, 12, 18, 28)
     * @param isInterstate - Whether supply is interstate
     * @param cessRate - Additional cess rate if applicable
     */
    calculateTax(
        taxableAmount: number,
        gstRate: number,
        isInterstate: boolean,
        cessRate: number = 0
    ): { cgst: number; sgst: number; igst: number; cess: number; total: number } {
        const gstAmount = (taxableAmount * gstRate) / 100;
        const cessAmount = (taxableAmount * cessRate) / 100;

        if (isInterstate) {
            return {
                cgst: 0,
                sgst: 0,
                igst: gstAmount,
                cess: cessAmount,
                total: gstAmount + cessAmount,
            };
        } else {
            return {
                cgst: gstAmount / 2,
                sgst: gstAmount / 2,
                igst: 0,
                cess: cessAmount,
                total: gstAmount + cessAmount,
            };
        }
    }

    /**
     * Round off as per GST rules (nearest rupee)
     */
    roundOff(amount: number): number {
        return Math.round(amount);
    }

    // =====================
    // GSTR-1 PREPARATION
    // =====================

    /**
     * Prepare GSTR-1 return data
     */
    prepareGstr1(month: number, year: number): Gstr1Return {
        const profile = this.getProfile();
        const invoices = this.getSaleInvoices();

        // Filter invoices for the month
        const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() + 1 === month &&
                invDate.getFullYear() === year &&
                inv.status !== 'cancelled';
        });

        // Separate B2B and B2C
        const b2bInvoices = monthInvoices.filter(inv => inv.invoiceType === 'B2B' && inv.partyGstin);
        const b2cLargeInvoices = monthInvoices.filter(inv =>
            inv.invoiceType === 'B2C' && inv.totalAmount > 250000 && inv.isInterstate
        );
        const b2cSmallInvoices = monthInvoices.filter(inv =>
            inv.invoiceType === 'B2C' && (inv.totalAmount <= 250000 || !inv.isInterstate)
        );

        // Group B2B by customer GSTIN
        const b2bGrouped: Record<string, Gstr1B2bInvoice[]> = {};
        for (const inv of b2bInvoices) {
            const ctin = inv.partyGstin!;
            if (!b2bGrouped[ctin]) {
                b2bGrouped[ctin] = [];
            }

            // Group by tax rate within invoice
            const rateGroups: Record<number, { taxableValue: number; igst: number; cgst: number; sgst: number; cess: number }> = {};

            for (const item of inv.items) {
                const rate = item.gstRate;
                if (!rateGroups[rate]) {
                    rateGroups[rate] = { taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
                }
                rateGroups[rate].taxableValue += item.taxableAmount;
                rateGroups[rate].igst += item.igst;
                rateGroups[rate].cgst += item.cgst;
                rateGroups[rate].sgst += item.sgst;
                rateGroups[rate].cess += item.cessAmount || 0;
            }

            for (const [rate, values] of Object.entries(rateGroups)) {
                b2bGrouped[ctin].push({
                    invoiceNo: inv.invoiceNumber,
                    invoiceDate: new Date(inv.date).toLocaleDateString('en-IN'),
                    invoiceValue: inv.totalAmount,
                    placeOfSupply: inv.placeOfSupply,
                    reverseCharge: inv.reverseCharge ? 'Y' : 'N',
                    invoiceType: 'R', // Regular
                    rate: Number(rate),
                    taxableValue: values.taxableValue,
                    igst: values.igst,
                    cgst: values.cgst,
                    sgst: values.sgst,
                    cess: values.cess,
                });
            }
        }

        // B2CS Summary by place of supply and rate
        const b2csSummary: Record<string, Gstr1B2csSummary> = {};
        for (const inv of b2cSmallInvoices) {
            for (const item of inv.items) {
                const key = `${inv.placeOfSupply}-${item.gstRate}`;
                if (!b2csSummary[key]) {
                    b2csSummary[key] = {
                        placeOfSupply: inv.placeOfSupply,
                        rate: item.gstRate,
                        taxableValue: 0,
                        cgst: 0,
                        sgst: 0,
                        igst: 0,
                        cess: 0,
                    };
                }
                b2csSummary[key].taxableValue += item.taxableAmount;
                b2csSummary[key].cgst += item.cgst;
                b2csSummary[key].sgst += item.sgst;
                b2csSummary[key].igst += item.igst;
                b2csSummary[key].cess += item.cessAmount || 0;
            }
        }

        // HSN Summary
        const hsnSummary: Record<string, Gstr1HsnSummary> = {};
        for (const inv of monthInvoices) {
            for (const item of inv.items) {
                if (!hsnSummary[item.hsnCode]) {
                    hsnSummary[item.hsnCode] = {
                        hsnCode: item.hsnCode,
                        description: item.name,
                        uqc: item.unit.toUpperCase(),
                        quantity: 0,
                        taxableValue: 0,
                        igst: 0,
                        cgst: 0,
                        sgst: 0,
                        cess: 0,
                        totalTax: 0,
                    };
                }
                hsnSummary[item.hsnCode].quantity += item.quantity;
                hsnSummary[item.hsnCode].taxableValue += item.taxableAmount;
                hsnSummary[item.hsnCode].igst += item.igst;
                hsnSummary[item.hsnCode].cgst += item.cgst;
                hsnSummary[item.hsnCode].sgst += item.sgst;
                hsnSummary[item.hsnCode].cess += item.cessAmount || 0;
                hsnSummary[item.hsnCode].totalTax += item.cgst + item.sgst + item.igst + (item.cessAmount || 0);
            }
        }

        // Calculate nil rated, exempt, non-GST
        const nilRated = monthInvoices
            .filter(inv => inv.items.every(item => item.gstRate === 0))
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

        // Document summary
        const invoiceNumbers = monthInvoices.map(inv => inv.invoiceNumber).sort();
        const cancelledCount = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() + 1 === month &&
                invDate.getFullYear() === year &&
                inv.status === 'cancelled';
        }).length;

        return {
            gstin: profile?.gstin || '',
            financialPeriod: `${month.toString().padStart(2, '0')}${year}`,
            returnType: 'GSTR1',
            b2b: Object.entries(b2bGrouped).map(([ctin, invoices]) => ({
                ctin,
                invoices,
            })),
            b2cl: [], // B2C Large - similar structure
            b2cs: Object.values(b2csSummary),
            hsn: Object.values(hsnSummary),
            nil: {
                nilRated,
                exempted: 0,
                nonGst: 0,
            },
            docs: {
                invoiceNo: {
                    from: invoiceNumbers[0] || '',
                    to: invoiceNumbers[invoiceNumbers.length - 1] || '',
                    total: invoiceNumbers.length,
                    cancelled: cancelledCount,
                },
            },
        };
    }

    // =====================
    // GSTR-3B PREPARATION
    // =====================

    /**
     * Prepare GSTR-3B summary
     */
    prepareGstr3b(month: number, year: number): Gstr3bSummary {
        const profile = this.getProfile();
        const saleInvoices = this.getSaleInvoices();
        const purchaseInvoices = this.getPurchaseInvoices();

        // Filter invoices for the month
        const monthSales = saleInvoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() + 1 === month &&
                invDate.getFullYear() === year &&
                inv.status !== 'cancelled';
        });

        const monthPurchases = purchaseInvoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() + 1 === month &&
                invDate.getFullYear() === year &&
                inv.status !== 'cancelled';
        });

        // 3.1 - Outward supplies
        const outwardTaxable = {
            integratedTax: monthSales.reduce((sum, inv) => sum + inv.igstTotal, 0),
            centralTax: monthSales.reduce((sum, inv) => sum + inv.cgstTotal, 0),
            stateTax: monthSales.reduce((sum, inv) => sum + inv.sgstTotal, 0),
            cess: monthSales.reduce((sum, inv) => sum + inv.cessTotal, 0),
        };

        // Nil rated and exempt
        const nilRatedSales = monthSales
            .filter(inv => inv.items.every(item => item.gstRate === 0))
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

        // 4 - ITC available from purchases
        const itcAvailable = {
            import: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
            importService: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
            inward: {
                igst: monthPurchases.reduce((sum, inv) => sum + inv.igstTotal, 0),
                cgst: monthPurchases.reduce((sum, inv) => sum + inv.cgstTotal, 0),
                sgst: monthPurchases.reduce((sum, inv) => sum + inv.sgstTotal, 0),
                cess: monthPurchases.reduce((sum, inv) => sum + inv.cessTotal, 0),
            },
            isd: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
            all: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        };

        itcAvailable.all = {
            igst: itcAvailable.inward.igst,
            cgst: itcAvailable.inward.cgst,
            sgst: itcAvailable.inward.sgst,
            cess: itcAvailable.inward.cess,
        };

        // Net ITC
        const netItc = { ...itcAvailable.all };

        // Tax payable
        const taxPayable = {
            igst: Math.max(0, outwardTaxable.integratedTax - netItc.igst),
            cgst: Math.max(0, outwardTaxable.centralTax - netItc.cgst),
            sgst: Math.max(0, outwardTaxable.stateTax - netItc.sgst),
            cess: Math.max(0, outwardTaxable.cess - netItc.cess),
        };

        return {
            gstin: profile?.gstin || '',
            period: `${month.toString().padStart(2, '0')}${year}`,
            outwardTaxable,
            outwardZeroRated: 0,
            outwardNilRated: nilRatedSales,
            outwardExempt: 0,
            outwardNonGst: 0,
            interStateUnregistered: 0,
            interStateComposition: 0,
            interStateUin: 0,
            itcAvailable,
            itcReversed: {
                asPerRules: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
                others: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
            },
            netItc,
            inwardNilExempt: {
                interstate: 0,
                intrastate: 0,
            },
            taxPayable,
            taxPaidCash: taxPayable, // Assuming full payment
            taxPaidItc: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
            interest: 0,
            lateFee: 0,
        };
    }

    // =====================
    // E-INVOICE
    // =====================

    /**
     * Generate E-Invoice request structure
     */
    generateEInvoiceRequest(invoiceId: string): EInvoiceRequest | null {
        const data = localStorage.getItem(STORAGE_KEYS.SALE_INVOICES);
        const invoices: SaleInvoice[] = data ? JSON.parse(data) : [];
        const invoice = invoices.find(inv => inv.id === invoiceId);

        if (!invoice || invoice.invoiceType !== 'B2B') {
            return null;
        }

        const profile = this.getProfile();
        if (!profile) return null;

        const invDate = new Date(invoice.date);
        const formattedDate = `${invDate.getDate().toString().padStart(2, '0')}/${(invDate.getMonth() + 1).toString().padStart(2, '0')}/${invDate.getFullYear()}`;

        const itemList = invoice.items.map((item, index) => ({
            SlNo: (index + 1).toString(),
            PrdDesc: item.name,
            IsServc: 'N' as const,
            HsnCd: item.hsnCode,
            Qty: item.quantity,
            Unit: item.unit.toUpperCase(),
            UnitPrice: item.rate,
            TotAmt: item.rate * item.quantity,
            Discount: item.discount,
            PreTaxVal: item.taxableAmount,
            AssAmt: item.taxableAmount,
            GstRt: item.gstRate,
            IgstAmt: item.igst,
            CgstAmt: item.cgst,
            SgstAmt: item.sgst,
            CesRt: item.cessRate,
            CesAmt: item.cessAmount,
            TotItemVal: item.total,
        }));

        return {
            Version: '1.1',
            TranDtls: {
                TaxSch: 'GST',
                SupTyp: 'B2B',
                RegRev: invoice.reverseCharge ? 'Y' : 'N',
                IgstOnIntra: 'N',
            },
            DocDtls: {
                Typ: 'INV',
                No: invoice.invoiceNumber,
                Dt: formattedDate,
            },
            SellerDtls: {
                Gstin: profile.gstin,
                LglNm: profile.name,
                TrdNm: profile.tradeName,
                Addr1: profile.address,
                Loc: profile.city,
                Pin: parseInt(profile.pincode),
                Stcd: profile.stateCode,
                Ph: profile.phone,
                Em: profile.email,
            },
            BuyerDtls: {
                Gstin: invoice.partyGstin || '',
                LglNm: invoice.partyName,
                Pos: invoice.placeOfSupply,
                Addr1: invoice.partyAddress || '',
                Loc: '',
                Pin: 0,
                Stcd: invoice.partyStateCode || '',
                Ph: invoice.partyPhone,
            },
            ItemList: itemList,
            ValDtls: {
                AssVal: invoice.taxableAmount,
                CgstVal: invoice.cgstTotal,
                SgstVal: invoice.sgstTotal,
                IgstVal: invoice.igstTotal,
                CesVal: invoice.cessTotal,
                Discount: invoice.discountTotal,
                RndOffAmt: invoice.roundOff,
                TotInvVal: invoice.totalAmount,
            },
        };
    }

    // =====================
    // REPORTS
    // =====================

    /**
     * Get tax liability summary
     */
    getTaxLiabilitySummary(startDate: string, endDate: string): {
        totalSales: number;
        taxableValue: number;
        cgst: number;
        sgst: number;
        igst: number;
        cess: number;
        totalTax: number;
    } {
        const invoices = this.getSaleInvoices().filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= new Date(startDate) &&
                invDate <= new Date(endDate) &&
                inv.status !== 'cancelled';
        });

        return {
            totalSales: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
            taxableValue: invoices.reduce((sum, inv) => sum + inv.taxableAmount, 0),
            cgst: invoices.reduce((sum, inv) => sum + inv.cgstTotal, 0),
            sgst: invoices.reduce((sum, inv) => sum + inv.sgstTotal, 0),
            igst: invoices.reduce((sum, inv) => sum + inv.igstTotal, 0),
            cess: invoices.reduce((sum, inv) => sum + inv.cessTotal, 0),
            totalTax: invoices.reduce((sum, inv) =>
                sum + inv.cgstTotal + inv.sgstTotal + inv.igstTotal + inv.cessTotal, 0
            ),
        };
    }

    /**
     * Get ITC summary
     */
    getItcSummary(startDate: string, endDate: string): {
        totalPurchases: number;
        taxableValue: number;
        cgst: number;
        sgst: number;
        igst: number;
        cess: number;
        totalItc: number;
    } {
        const invoices = this.getPurchaseInvoices().filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= new Date(startDate) &&
                invDate <= new Date(endDate) &&
                inv.status !== 'cancelled';
        });

        return {
            totalPurchases: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
            taxableValue: invoices.reduce((sum, inv) => sum + inv.taxableAmount, 0),
            cgst: invoices.reduce((sum, inv) => sum + inv.cgstTotal, 0),
            sgst: invoices.reduce((sum, inv) => sum + inv.sgstTotal, 0),
            igst: invoices.reduce((sum, inv) => sum + inv.igstTotal, 0),
            cess: invoices.reduce((sum, inv) => sum + inv.cessTotal, 0),
            totalItc: invoices.reduce((sum, inv) =>
                sum + inv.cgstTotal + inv.sgstTotal + inv.igstTotal + inv.cessTotal, 0
            ),
        };
    }
}

// Export singleton instance
export const gstService = new GstService();
export default gstService;
