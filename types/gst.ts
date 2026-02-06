// GST Types for Production-Grade ERP

/**
 * GST tax slabs in India
 */
export type GstRate = 0 | 0.1 | 0.25 | 3 | 5 | 12 | 18 | 28;

/**
 * State codes for GST
 */
export const STATE_CODES: Record<string, string> = {
    '01': 'Jammu & Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra & Nagar Haveli and Daman & Diu',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh (Old)',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman & Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
    '38': 'Ladakh',
};

/**
 * HSN Code entry
 */
export interface HsnCode {
    code: string;
    description: string;
    gstRate: GstRate;
    cessRate?: number;
    unit?: string;
}

/**
 * GSTR-1 B2B Invoice
 */
export interface Gstr1B2bInvoice {
    invoiceNo: string;
    invoiceDate: string;
    invoiceValue: number;
    placeOfSupply: string;
    reverseCharge: 'Y' | 'N';
    invoiceType: 'R' | 'SEWP' | 'SEWOP' | 'DE';
    eCommerceGstin?: string;
    rate: number;
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
}

/**
 * GSTR-1 B2C Large (> 2.5 Lakh)
 */
export interface Gstr1B2clInvoice {
    invoiceNo: string;
    invoiceDate: string;
    invoiceValue: number;
    placeOfSupply: string;
    rate: number;
    taxableValue: number;
    igst: number;
    cess: number;
    eCommerceGstin?: string;
}

/**
 * GSTR-1 B2C Small
 */
export interface Gstr1B2csSummary {
    placeOfSupply: string;
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
}

/**
 * GSTR-1 HSN Summary
 */
export interface Gstr1HsnSummary {
    hsnCode: string;
    description: string;
    uqc: string; // Unit Quantity Code
    quantity: number;
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
    totalTax: number;
}

/**
 * GSTR-1 Complete Return
 */
export interface Gstr1Return {
    gstin: string;
    financialPeriod: string; // MMYYYY format
    returnType: 'GSTR1';

    b2b: Array<{
        ctin: string; // Customer GSTIN
        invoices: Gstr1B2bInvoice[];
    }>;

    b2cl: Array<{
        placeOfSupply: string;
        invoices: Gstr1B2clInvoice[];
    }>;

    b2cs: Gstr1B2csSummary[];

    hsn: Gstr1HsnSummary[];

    nil: {
        nilRated: number;
        exempted: number;
        nonGst: number;
    };

    docs: {
        invoiceNo: {
            from: string;
            to: string;
            total: number;
            cancelled: number;
        };
    };
}

/**
 * GSTR-3B Summary
 */
export interface Gstr3bSummary {
    gstin: string;
    period: string;

    // 3.1 - Outward supplies
    outwardTaxable: {
        integratedTax: number;
        centralTax: number;
        stateTax: number;
        cess: number;
    };

    outwardZeroRated: number;
    outwardNilRated: number;
    outwardExempt: number;
    outwardNonGst: number;

    // 3.2 - Inter-state supplies
    interStateUnregistered: number;
    interStateComposition: number;
    interStateUin: number;

    // 4 - Eligible ITC
    itcAvailable: {
        import: { igst: number; cgst: number; sgst: number; cess: number };
        importService: { igst: number; cgst: number; sgst: number; cess: number };
        inward: { igst: number; cgst: number; sgst: number; cess: number };
        isd: { igst: number; cgst: number; sgst: number; cess: number };
        all: { igst: number; cgst: number; sgst: number; cess: number };
    };

    itcReversed: {
        asPerRules: { igst: number; cgst: number; sgst: number; cess: number };
        others: { igst: number; cgst: number; sgst: number; cess: number };
    };

    netItc: { igst: number; cgst: number; sgst: number; cess: number };

    // 5 - Exempt, nil, non-GST inward
    inwardNilExempt: {
        interstate: number;
        intrastate: number;
    };

    // 6 - Tax payable and paid
    taxPayable: {
        igst: number;
        cgst: number;
        sgst: number;
        cess: number;
    };

    taxPaidCash: {
        igst: number;
        cgst: number;
        sgst: number;
        cess: number;
    };

    taxPaidItc: {
        igst: number;
        cgst: number;
        sgst: number;
        cess: number;
    };

    interest: number;
    lateFee: number;
}

/**
 * E-Invoice structure for IRN generation
 */
export interface EInvoiceRequest {
    Version: '1.1';
    TranDtls: {
        TaxSch: 'GST';
        SupTyp: 'B2B' | 'SEZWP' | 'SEZWOP' | 'EXPWP' | 'EXPWOP' | 'DEXP';
        RegRev: 'Y' | 'N';
        EcmGstin?: string;
        IgstOnIntra: 'Y' | 'N';
    };
    DocDtls: {
        Typ: 'INV' | 'CRN' | 'DBN';
        No: string;
        Dt: string; // DD/MM/YYYY
    };
    SellerDtls: {
        Gstin: string;
        LglNm: string;
        TrdNm?: string;
        Addr1: string;
        Addr2?: string;
        Loc: string;
        Pin: number;
        Stcd: string;
        Ph?: string;
        Em?: string;
    };
    BuyerDtls: {
        Gstin: string;
        LglNm: string;
        TrdNm?: string;
        Pos: string;
        Addr1: string;
        Addr2?: string;
        Loc: string;
        Pin: number;
        Stcd: string;
        Ph?: string;
        Em?: string;
    };
    ItemList: Array<{
        SlNo: string;
        PrdDesc: string;
        IsServc: 'Y' | 'N';
        HsnCd: string;
        Qty: number;
        Unit: string;
        UnitPrice: number;
        TotAmt: number;
        Discount: number;
        PreTaxVal: number;
        AssAmt: number;
        GstRt: number;
        IgstAmt: number;
        CgstAmt: number;
        SgstAmt: number;
        CesRt?: number;
        CesAmt?: number;
        StateCesRt?: number;
        StateCesAmt?: number;
        TotItemVal: number;
    }>;
    ValDtls: {
        AssVal: number;
        CgstVal: number;
        SgstVal: number;
        IgstVal: number;
        CesVal?: number;
        StCesVal?: number;
        Discount: number;
        OthChrg?: number;
        RndOffAmt: number;
        TotInvVal: number;
    };
}

/**
 * E-Way Bill structure
 */
export interface EWayBillRequest {
    supplyType: 'O' | 'I'; // Outward/Inward
    subSupplyType: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    docType: 'INV' | 'BIL' | 'BOE' | 'CHL' | 'OTH';
    docNo: string;
    docDate: string;
    fromGstin: string;
    fromTrdName: string;
    fromAddr1: string;
    fromAddr2?: string;
    fromPlace: string;
    fromPincode: number;
    fromStateCode: number;
    toGstin: string;
    toTrdName: string;
    toAddr1: string;
    toAddr2?: string;
    toPlace: string;
    toPincode: number;
    toStateCode: number;
    transactionType: 1 | 2 | 3 | 4;
    totalValue: number;
    cgstValue: number;
    sgstValue: number;
    igstValue: number;
    cessValue: number;
    transporterId?: string;
    transporterName?: string;
    transDocNo?: string;
    transMode: '1' | '2' | '3' | '4'; // Road, Rail, Air, Ship
    transDistance: number;
    transDocDate?: string;
    vehicleNo?: string;
    vehicleType: 'R' | 'O'; // Regular, ODC
    itemList: Array<{
        productName: string;
        productDesc: string;
        hsnCode: number;
        quantity: number;
        qtyUnit: string;
        cgstRate: number;
        sgstRate: number;
        igstRate: number;
        cessRate?: number;
        taxableAmount: number;
    }>;
}
