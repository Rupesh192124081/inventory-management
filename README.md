# Distributor ERP System

A production-grade Enterprise Resource Planning system for distributors, built with React, TypeScript, and modern web technologies. Features a comprehensive admin dashboard for inventory, billing, GST compliance, and financial management, plus a customer-facing storefront with real-time stock synchronization.

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Features Overview](#features-overview)
4. [Business Logic Documentation](#business-logic-documentation)
5. [Backend Architecture](#backend-architecture)
6. [Design System Documentation](#design-system-documentation)
7. [Implementation Guide](#implementation-guide)
8. [API Reference](#api-reference)
9. [Getting Started](#getting-started)
10. [Deployment](#deployment)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DISTRIBUTOR ERP SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│   │     ADMIN DASHBOARD         │    │    CUSTOMER STOREFRONT       │        │
│   │     (Port 5175)             │    │    (Port 5173)               │        │
│   │                             │    │                               │        │
│   │  • Inventory Management     │    │  • Product Catalog           │        │
│   │  • Billing & Invoicing      │    │  • Shopping Cart             │        │
│   │  • Party/CRM Management     │    │  • Checkout with Stock Check │        │
│   │  • GST Compliance           │    │  • Order Confirmation        │        │
│   │  • Financial Reports        │    │  • WhatsApp Invoice Sharing  │        │
│   │  • Payment Reconciliation   │    │                               │        │
│   └──────────────┬──────────────┘    └──────────────┬────────────────┘        │
│                  │                                   │                        │
│                  └───────────────┬───────────────────┘                        │
│                                  │                                            │
│                  ┌───────────────▼───────────────┐                            │
│                  │      SHARED SERVICE LAYER      │                            │
│                  │                                │                            │
│                  │  • inventoryService.ts        │                            │
│                  │  • billingService.ts          │                            │
│                  │  • gstService.ts              │                            │
│                  │  • paymentService.ts          │                            │
│                  │  • storefrontSyncService.ts   │                            │
│                  └───────────────┬───────────────┘                            │
│                                  │                                            │
│                  ┌───────────────▼───────────────┐                            │
│                  │      LOCAL STORAGE LAYER       │                            │
│                  │                                │                            │
│                  │  • vyapar_items                │                            │
│                  │  • vyapar_parties              │                            │
│                  │  • vyapar_invoices             │                            │
│                  │  • vyapar_payments             │                            │
│                  │  • stock_ledger                │                            │
│                  └────────────────────────────────┘                            │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN DASHBOARD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │  Inventory  │  │   Billing   │  │   Parties   │  │  GST Comp   │        │
│   │   .tsx      │  │    .tsx     │  │    .tsx     │  │    .tsx     │        │
│   │             │  │             │  │             │  │             │        │
│   │ • SKU Mgmt  │  │ • Sale Inv  │  │ • Customer  │  │ • GSTR-1    │        │
│   │ • Batches   │  │ • Purchase  │  │ • Vendor    │  │ • GSTR-3B   │        │
│   │ • Valuation │  │ • Returns   │  │ • Credit    │  │ • E-Invoice │        │
│   │ • Variants  │  │ • Partial   │  │ • Ledger    │  │ • HSN Summ  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │   Reports   │  │ Stock Ledge │  │ Purchase    │  │ Payment     │        │
│   │    .tsx     │  │    r.tsx    │  │ Invoice.tsx │  │ Recon.tsx   │        │
│   │             │  │             │  │             │  │             │        │
│   │ • P&L Stmt  │  │ • Audit     │  │ • Supplier  │  │ • Aging     │        │
│   │ • Stock Age │  │ • Movement  │  │ • Stock IN  │  │ • Receivable│        │
│   │ • Analytics │  │ • CSV Export│  │ • GST Calc  │  │ • Payables  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   USER ACTION                                                                 │
│       │                                                                       │
│       ▼                                                                       │
│   ┌─────────────────┐                                                        │
│   │  React Component │ ───────────────────────────────────────┐              │
│   └────────┬────────┘                                         │              │
│            │                                                  │              │
│            ▼                                                  │              │
│   ┌─────────────────┐     ┌─────────────────┐                │              │
│   │  Service Layer  │────▶│ Business Logic  │                │              │
│   │                 │     │                 │                │              │
│   │ • Validation    │     │ • Stock Check   │                │              │
│   │ • Calculation   │     │ • Credit Check  │                │              │
│   │ • Formatting    │     │ • GST Calc      │                │              │
│   └────────┬────────┘     └─────────────────┘                │              │
│            │                                                  │              │
│            ▼                                                  │              │
│   ┌─────────────────┐                                        │              │
│   │  localStorage   │ ◀───────────────────────────────────────┘              │
│   │                 │                                                        │
│   │  Persist Data   │                                                        │
│   └─────────────────┘                                                        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 | UI Framework with latest concurrent features |
| **Language** | TypeScript 5.6 | Type safety and better DX |
| **Build** | Vite 6.0 | Fast HMR and optimized builds |
| **Styling** | Tailwind CSS 3.4 | Utility-first styling |
| **Icons** | Lucide React | Beautiful, consistent iconography |
| **State** | React useState/useMemo | Local component state |
| **Storage** | localStorage | Client-side persistence |
| **Routing** | React Router 7 | SPA navigation |

---

## Features Overview

### Admin Dashboard Features

| Feature | Description |
|---------|-------------|
| **Inventory Management** | SKU management, batch tracking, variant support, stock valuation (FIFO/Weighted Avg), opening stock entry, low stock alerts |
| **Billing System** | Sale/Purchase invoices, credit limit enforcement, partial payments, return invoices, loyalty points, barcode scanning |
| **Party Management** | Customer/Vendor CRM, credit limit settings, credit days, outstanding alerts, WhatsApp reminders, ledger statements |
| **GST Compliance** | CGST/SGST/IGST auto-calculation, GSTR-1 export, GSTR-3B summary, E-Invoice structure, HSN-wise summaries |
| **Reports** | Profit & Loss statement, Stock aging report, Vendor/Customer analytics, CSV export |
| **Payment Reconciliation** | Receivables/Payables tracking, Aging analysis (0-30, 31-60, 61-90, 90+ days), Payment history |
| **Stock Ledger** | Complete audit trail, Movement history, Reference tracking, CSV export |

### Storefront Features

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Category-wise browsing, Search, Stock indicators |
| **Real-time Stock** | Live stock checking from admin inventory |
| **Shopping Cart** | Stock validation, Quantity limits |
| **Checkout** | Stock reservation, Atomic deduction |
| **Order Confirmation** | WhatsApp invoice sharing |

---

## Business Logic Documentation

### 1. Inventory Service (`services/inventoryService.ts`)

The inventory service handles all stock-related operations with atomic transactions and complete audit trails.

#### Core Operations

```typescript
// Stock Addition (Purchase/Opening Stock)
addStock(itemId: string, quantity: number, purchasePrice: number, referenceId: string, batchNumber?: string): StockResult

// Stock Deduction (Sale)
deductStock(itemId: string, quantity: number, referenceId: string): StockResult

// Stock Adjustment (Manual correction)
adjustStock(itemId: string, newQuantity: number, reason: string, referenceId: string): StockResult
```

#### Negative Stock Prevention

```typescript
function deductStock(itemId: string, quantity: number, referenceId: string): StockResult {
    const item = getItemById(itemId);
    
    // HARD BLOCK: Never allow negative stock
    if (item.stock < quantity) {
        return {
            success: false,
            error: `Insufficient stock. Available: ${item.stock}, Requested: ${quantity}`
        };
    }
    
    // Atomic deduction with ledger entry
    item.stock -= quantity;
    recordLedgerEntry({
        itemId,
        type: 'out',
        quantity,
        referenceId,
        date: new Date().toISOString(),
        runningBalance: item.stock
    });
    
    return { success: true, newStock: item.stock };
}
```

#### Stock Valuation

```typescript
function getStockValuation(): StockValuation {
    const items = getAllItems();
    
    return {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, i) => sum + i.stock, 0),
        totalValue: items.reduce((sum, i) => sum + (i.stock * i.purchasePrice), 0),
        valuationMethod: 'Weighted Average Cost'
    };
}
```

### 2. Billing Service (`services/billingService.ts`)

Handles invoice creation with integrated stock and payment management.

#### Credit Limit Validation

```typescript
function validateCreditLimit(partyId: string, amount: number): CreditValidation {
    const party = getPartyById(partyId);
    const creditLimit = party.creditLimit || 0;
    const currentBalance = party.balance || 0;
    
    const availableCredit = creditLimit - currentBalance;
    
    if (amount > availableCredit) {
        return {
            allowed: false,
            message: `Credit limit exceeded. Available: ₹${availableCredit.toLocaleString()}, Requested: ₹${amount.toLocaleString()}`,
            currentBalance,
            creditLimit
        };
    }
    
    return { allowed: true, currentBalance, creditLimit };
}
```

#### Invoice Creation Flow

```typescript
function createSaleInvoice(params: CreateSaleInvoiceParams): InvoiceResult {
    // 1. Validate stock availability
    for (const item of params.items) {
        const stockCheck = inventoryService.validateStockAvailability(item.itemId, item.quantity);
        if (!stockCheck.available) {
            return { success: false, error: stockCheck.message };
        }
    }
    
    // 2. Validate credit limit (if credit sale)
    if (params.paymentMode !== 'cash') {
        const creditCheck = validateCreditLimit(params.partyId, params.totalAmount - params.paidAmount);
        if (!creditCheck.allowed) {
            return { success: false, error: creditCheck.message };
        }
    }
    
    // 3. Generate invoice number
    const invoiceNumber = generateInvoiceNumber('INV');
    
    // 4. Deduct stock atomically
    for (const item of params.items) {
        inventoryService.deductStock(item.itemId, item.quantity, invoiceNumber);
    }
    
    // 5. Update party balance
    updatePartyBalance(params.partyId, params.totalAmount - params.paidAmount);
    
    // 6. Calculate loyalty points
    const pointsEarned = Math.floor(params.totalAmount * 0.01);
    
    // 7. Create and save invoice
    const invoice = createInvoiceRecord({...params, invoiceNumber, pointsEarned});
    saveInvoice(invoice);
    
    return { success: true, invoice };
}
```

### 3. GST Service (`services/gstService.ts`)

Complete GST compliance including tax calculation and return preparation.

#### Tax Calculation

```typescript
function calculateGST(amount: number, gstRate: number, isSameState: boolean): GSTBreakdown {
    const taxableAmount = amount / (1 + gstRate / 100);
    const totalTax = amount - taxableAmount;
    
    if (isSameState) {
        // Intra-state: Split into CGST + SGST
        return {
            taxableAmount,
            cgst: totalTax / 2,
            sgst: totalTax / 2,
            igst: 0,
            totalTax
        };
    } else {
        // Inter-state: Full IGST
        return {
            taxableAmount,
            cgst: 0,
            sgst: 0,
            igst: totalTax,
            totalTax
        };
    }
}
```

#### GSTR-1 Preparation

```typescript
function prepareGstr1(month: number, year: number): Gstr1Return {
    const invoices = getInvoicesForPeriod(month, year);
    
    // B2B Invoices (Business to Business - GST registered)
    const b2b = invoices
        .filter(inv => inv.partyGstin && inv.totalAmount > 0)
        .map(inv => ({
            ctin: inv.partyGstin,
            invNumber: inv.id,
            invDate: inv.date,
            invValue: inv.totalAmount,
            taxableValue: inv.subTotal,
            cgst: inv.cgst,
            sgst: inv.sgst,
            igst: inv.igst
        }));
    
    // HSN Summary
    const hsn = groupByHSN(invoices);
    
    return { b2b, hsn, period: `${month}/${year}` };
}
```

### 4. Payment Service (`services/paymentService.ts`)

Manages payment recording, allocation, and outstanding tracking.

#### Payment Allocation

```typescript
function recordPaymentIn(params: PaymentInParams): PaymentResult {
    const payment: PaymentRecord = {
        id: generatePaymentId(),
        partyId: params.partyId,
        amount: params.amount,
        date: params.date,
        mode: params.mode,
        type: 'in',
        allocations: []
    };
    
    // Auto-allocate to oldest unpaid invoices (FIFO)
    let remainingAmount = params.amount;
    const unpaidInvoices = getUnpaidInvoices(params.partyId);
    
    for (const invoice of unpaidInvoices) {
        if (remainingAmount <= 0) break;
        
        const dueAmount = invoice.totalAmount - invoice.paidAmount;
        const allocatedAmount = Math.min(remainingAmount, dueAmount);
        
        payment.allocations.push({
            invoiceId: invoice.id,
            allocatedAmount
        });
        
        remainingAmount -= allocatedAmount;
    }
    
    savePayment(payment);
    updatePartyBalance(params.partyId, -params.amount);
    
    return { success: true, payment };
}
```

#### Aging Analysis

```typescript
function getAgingSummary(partyId?: string): AgingSummary {
    const receivables = getOutstandingReceivables(partyId);
    const today = new Date();
    
    const buckets = {
        current: 0,      // 0-30 days
        days31_60: 0,    // 31-60 days
        days61_90: 0,    // 61-90 days
        over90: 0        // 90+ days
    };
    
    for (const entry of receivables) {
        const daysSince = Math.floor((today - new Date(entry.invoiceDate)) / (1000 * 60 * 60 * 24));
        
        if (daysSince <= 30) buckets.current += entry.outstanding;
        else if (daysSince <= 60) buckets.days31_60 += entry.outstanding;
        else if (daysSince <= 90) buckets.days61_90 += entry.outstanding;
        else buckets.over90 += entry.outstanding;
    }
    
    return buckets;
}
```

---

## Backend Architecture

### Data Storage Schema

The system uses localStorage with the following key structure:

```
localStorage
├── vyapar_items          → Item[] (Inventory items with variants)
├── vyapar_parties        → Party[] (Customers and vendors)
├── vyapar_invoices       → Invoice[] (All sale/purchase/return invoices)
├── vyapar_payments       → PaymentRecord[] (All payment transactions)
├── vyapar_expenses       → Expense[] (Business expenses)
├── vyapar_profile        → BusinessProfile (Company settings)
├── stock_ledger          → StockLedgerEntry[] (Audit trail)
├── payment_allocations   → PaymentAllocation[] (Invoice-payment mapping)
└── storefront_orders     → StorefrontOrder[] (Online orders)
```

### Type Definitions

```typescript
// Core Item Type
interface Item {
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
    batches?: Batch[];
}

// Party with Credit Settings
interface Party {
    id: string;
    name: string;
    phone: string;
    type: 'customer' | 'vendor' | 'both';
    gstin?: string;
    balance: number;
    loyaltyPoints: number;
    creditLimit?: number;
    creditDays?: number;
}

// Invoice with Payment Status
interface Invoice {
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

// Stock Ledger Entry
interface StockLedgerEntry {
    id: string;
    itemId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    referenceId: string;
    referenceType: string;
    date: string;
    runningBalance: number;
    note?: string;
}
```

### Transaction Handling

All critical operations follow ACID-like principles:

```typescript
// Atomic Transaction Pattern
function performTransaction<T>(operation: () => T): TransactionResult<T> {
    // 1. Create snapshot of current state
    const snapshot = createStateSnapshot();
    
    try {
        // 2. Perform operation
        const result = operation();
        
        // 3. Persist changes
        persistState();
        
        return { success: true, data: result };
        
    } catch (error) {
        // 4. Rollback on failure
        restoreSnapshot(snapshot);
        
        return { success: false, error: error.message };
    }
}
```

---

## Design System Documentation

### Color Palette

```css
/* Primary Colors */
--indigo-600: #4F46E5;   /* Primary actions, links */
--indigo-700: #4338CA;   /* Primary hover states */
--indigo-50:  #EEF2FF;   /* Primary backgrounds */

/* Semantic Colors */
--emerald-600: #059669;  /* Success, positive values */
--rose-600:    #E11D48;  /* Danger, negative values */
--amber-500:   #F59E0B;  /* Warning, pending states */
--purple-600:  #9333EA;  /* Secondary accent */

/* Neutral Colors */
--slate-900: #0F172A;    /* Primary text */
--slate-700: #334155;    /* Secondary text */
--slate-400: #94A3B8;    /* Muted text */
--slate-100: #F1F5F9;    /* Borders, dividers */
--slate-50:  #F8FAFC;    /* Subtle backgrounds */
```

### Component Styles

```css
/* Card Component */
.card {
    @apply bg-white rounded-[2rem] border border-slate-200 
           shadow-sm hover:shadow-xl transition-all;
}

/* Button Primary */
.btn-primary {
    @apply px-6 py-3 bg-indigo-600 text-white rounded-2xl 
           font-black text-sm shadow-xl shadow-indigo-100
           hover:bg-indigo-700 transition-all;
}

/* Input Field */
.input {
    @apply w-full px-6 py-4 bg-slate-50 border border-slate-200 
           rounded-2xl outline-none font-bold
           focus:ring-4 focus:ring-indigo-500/10;
}

/* Badge */
.badge {
    @apply px-3 py-1 rounded-xl text-[10px] font-black 
           uppercase tracking-tighter;
}
```

### Typography Scale

```css
/* Headings */
.heading-1 { @apply text-3xl font-black tracking-tight; }
.heading-2 { @apply text-2xl font-black; }
.heading-3 { @apply text-xl font-black; }

/* Body */
.body-lg   { @apply text-lg font-bold; }
.body      { @apply text-sm font-medium; }
.body-sm   { @apply text-xs font-bold; }

/* Labels */
.label     { @apply text-[10px] font-black uppercase tracking-widest text-slate-400; }
```

### Spacing System

```
Spacing Scale (Tailwind defaults):
1   = 0.25rem  (4px)
2   = 0.5rem   (8px)
3   = 0.75rem  (12px)
4   = 1rem     (16px)
6   = 1.5rem   (24px)
8   = 2rem     (32px)
10  = 2.5rem   (40px)
12  = 3rem     (48px)
```

### Border Radius Tokens

```
rounded-lg    = 0.5rem   (8px)   - Small elements
rounded-xl    = 0.75rem  (12px)  - Medium elements
rounded-2xl   = 1rem     (16px)  - Buttons, inputs
rounded-3xl   = 1.5rem   (24px)  - Cards
rounded-[2rem]= 2rem     (32px)  - Large cards
rounded-full  = 9999px            - Circles
```

---

## Implementation Guide

### Setting Up the Project

```bash
# Clone the repository
git clone https://github.com/Rupesh192124081/inventory-management.git

# Navigate to project
cd inventory-management

# Install dependencies
npm install

# Start admin dashboard (port 5175)
npm run dev -- --port 5175

# In another terminal, start storefront (port 5173)
cd storefront && npm install && npm run dev
```

### Seeding Demo Data

The system includes demo data generation. To initialize:

```typescript
// In browser console or initialization script
import { initializeDemoData } from './services/demoData';

initializeDemoData();
// This creates sample items, parties, invoices, and payments
```

### Using the Services

```typescript
// Import services
import { inventoryService, billingService, gstService, paymentService } from './services';

// Check stock availability
const stockCheck = inventoryService.validateStockAvailability('item-123', 10);
if (!stockCheck.available) {
    console.error(stockCheck.message);
}

// Create a sale invoice
const result = billingService.createSaleInvoice({
    partyId: 'customer-1',
    items: [...],
    paymentMode: 'partial',
    paidAmount: 5000,
    totalAmount: 10000
});

// Calculate GST
const gst = gstService.calculateGST(1000, 18, true);
// { taxableAmount: 847.46, cgst: 76.27, sgst: 76.27, igst: 0 }

// Get aging summary
const aging = paymentService.getAgingSummary();
```

---

## API Reference

### Inventory Service

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addStock` | itemId, quantity, price, refId, batch? | StockResult | Add stock with ledger entry |
| `deductStock` | itemId, quantity, refId | StockResult | Remove stock with validation |
| `adjustStock` | itemId, newQty, reason, refId | StockResult | Manual stock correction |
| `getItemLedger` | itemId | LedgerEntry[] | Get item movement history |
| `getStockValuation` | - | StockValuation | Total inventory value |
| `getLowStockItems` | threshold? | Item[] | Items below min stock |
| `validateStockAvailability` | itemId, qty, variantId? | StockCheck | Pre-check stock levels |

### Billing Service

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createSaleInvoice` | CreateSaleParams | InvoiceResult | Create sale with stock deduction |
| `createPurchaseInvoice` | CreatePurchaseParams | InvoiceResult | Create purchase with stock addition |
| `createReturnInvoice` | originalInvoiceId, items | InvoiceResult | Process returns |
| `validateCreditLimit` | partyId, amount | CreditValidation | Check party credit |
| `generateInvoiceNumber` | prefix | string | Auto-increment invoice ID |
| `getInvoicesByParty` | partyId | Invoice[] | Party invoice history |

### GST Service

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `calculateGST` | amount, rate, isSameState | GSTBreakdown | Calculate tax components |
| `prepareGstr1` | month, year | Gstr1Return | Generate GSTR-1 data |
| `prepareGstr3b` | month, year | Gstr3bReturn | Generate GSTR-3B summary |
| `getHsnSummary` | invoices | HsnSummary[] | HSN-wise tax breakdown |
| `generateEInvoiceRequest` | invoiceId | EInvoicePayload | E-invoice JSON structure |

### Payment Service

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `recordPaymentIn` | PaymentInParams | PaymentResult | Record receipt with allocation |
| `recordPaymentOut` | PaymentOutParams | PaymentResult | Record payment to vendor |
| `getOutstandingReceivables` | partyId? | Outstanding[] | Pending customer dues |
| `getOutstandingPayables` | partyId? | Outstanding[] | Pending vendor dues |
| `getAgingSummary` | partyId? | AgingSummary | Bucket-wise aging |
| `getPartyLedger` | partyId | LedgerEntry[] | Party transaction history |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Rupesh192124081/inventory-management.git
cd inventory-management
npm install

# 2. Start development servers
npm run dev -- --port 5175  # Admin Dashboard
cd storefront && npm install && npm run dev  # Storefront

# 3. Access the applications
# Admin: http://localhost:5175
# Storefront: http://localhost:5173
```

### Project Structure

```
inventory-management/
├── components/           # React components
│   ├── Billing.tsx       # Sale/Purchase/Return invoicing
│   ├── Inventory.tsx     # SKU and stock management
│   ├── Parties.tsx       # Customer/Vendor CRM
│   ├── GSTCompliance.tsx # GST returns and compliance
│   ├── Reports.tsx       # Business analytics
│   ├── StockLedger.tsx   # Stock movement audit
│   └── ...
├── services/             # Business logic layer
│   ├── inventoryService.ts
│   ├── billingService.ts
│   ├── gstService.ts
│   ├── paymentService.ts
│   └── index.ts
├── types/                # TypeScript definitions
│   └── index.ts
├── storefront/           # Customer-facing app
│   ├── pages/
│   ├── components/
│   └── services/
├── App.tsx               # Main admin app
├── main.tsx              # Entry point
└── README.md             # This file
```

---

## Deployment

### Build for Production

```bash
# Build admin dashboard
npm run build

# Build storefront
cd storefront && npm run build
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   vercel deploy
   ```

2. **Netlify**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

### Environment Variables

For production, configure these in your deployment platform:

```env
VITE_APP_NAME=Distributor ERP
VITE_DEFAULT_GST_STATE=Karnataka
VITE_ENABLE_ANALYTICS=true
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

**Rupesh** - [@Rupesh192124081](https://github.com/Rupesh192124081)

Project Link: [https://github.com/Rupesh192124081/inventory-management](https://github.com/Rupesh192124081/inventory-management)
