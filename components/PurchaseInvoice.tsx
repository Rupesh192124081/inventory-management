import React, { useState, useMemo } from 'react';
import {
    Plus, Trash2, Search, Save, X, Package,
    Truck, Calendar, FileText, User, Calculator
} from 'lucide-react';
import { Item, Party } from '../types';
import { billingService } from '../services/billingService';
import { InvoiceItem } from '../types/billing';

interface PurchaseInvoiceProps {
    items: Item[];
    parties: Party[];
    onClose?: () => void;
    onSuccess?: () => void;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({
    items,
    parties,
    onClose,
    onSuccess
}) => {
    // Form state
    const [supplierId, setSupplierId] = useState('');
    const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
    const [supplierInvoiceDate, setSupplierInvoiceDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    // Cart state
    const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Payment state
    const [paymentMode, setPaymentMode] = useState<'cash' | 'credit' | 'upi' | 'cheque'>('credit');
    const [paidAmount, setPaidAmount] = useState(0);

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get suppliers only
    const suppliers = useMemo(() =>
        parties.filter(p => p.type === 'supplier' || p.type === 'both'),
        [parties]
    );

    // Selected supplier
    const selectedSupplier = useMemo(() =>
        suppliers.find(s => s.id === supplierId),
        [suppliers, supplierId]
    );

    // Filter items by search
    const filteredItems = useMemo(() => {
        if (!searchQuery) return items.slice(0, 20);
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query) ||
            item.hsnCode.includes(query)
        ).slice(0, 20);
    }, [items, searchQuery]);

    // Add item to cart
    const addToCart = (item: Item) => {
        const existing = cartItems.find(ci => ci.itemId === item.id);
        if (existing) {
            updateCartItem(item.id, existing.quantity + 1);
            return;
        }

        const taxableAmount = item.purchasePrice;
        const gstAmount = (taxableAmount * item.gstRate) / 100;

        const newItem: InvoiceItem = {
            id: `${Date.now()}`,
            itemId: item.id,
            name: item.name,
            sku: item.sku || '',
            hsnCode: item.hsnCode,
            quantity: 1,
            unit: item.unit,
            rate: item.purchasePrice,
            discount: 0,
            taxableAmount,
            gstRate: item.gstRate,
            cgst: gstAmount / 2,
            sgst: gstAmount / 2,
            igst: 0,
            total: taxableAmount + gstAmount,
        };

        setCartItems([...cartItems, newItem]);
        setSearchQuery('');
    };

    // Update cart item
    const updateCartItem = (itemId: string, quantity: number, rate?: number) => {
        setCartItems(cartItems.map(item => {
            if (item.itemId !== itemId) return item;

            const newRate = rate ?? item.rate;
            const taxableAmount = newRate * quantity - item.discount;
            const gstAmount = (taxableAmount * item.gstRate) / 100;

            return {
                ...item,
                quantity,
                rate: newRate,
                taxableAmount,
                cgst: gstAmount / 2,
                sgst: gstAmount / 2,
                total: taxableAmount + gstAmount,
            };
        }));
    };

    // Remove from cart
    const removeFromCart = (itemId: string) => {
        setCartItems(cartItems.filter(item => item.itemId !== itemId));
    };

    // Calculate totals
    const totals = useMemo(() => {
        const subTotal = cartItems.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
        const discountTotal = cartItems.reduce((sum, item) => sum + item.discount, 0);
        const taxableAmount = cartItems.reduce((sum, item) => sum + item.taxableAmount, 0);
        const cgstTotal = cartItems.reduce((sum, item) => sum + item.cgst, 0);
        const sgstTotal = cartItems.reduce((sum, item) => sum + item.sgst, 0);
        const total = Math.round(taxableAmount + cgstTotal + sgstTotal);

        return { subTotal, discountTotal, taxableAmount, cgstTotal, sgstTotal, total };
    }, [cartItems]);

    // Handle submit
    const handleSubmit = async () => {
        if (!supplierId) {
            setError('Please select a supplier');
            return;
        }
        if (!supplierInvoiceNo) {
            setError('Please enter supplier invoice number');
            return;
        }
        if (cartItems.length === 0) {
            setError('Please add at least one item');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = billingService.createPurchaseInvoice({
                supplierId,
                supplierName: selectedSupplier?.name || '',
                supplierGstin: selectedSupplier?.gstin,
                supplierInvoiceNo,
                supplierInvoiceDate,
                dueDate: dueDate || supplierInvoiceDate,
                items: cartItems,
                paymentMode,
                paidAmount: paymentMode === 'cash' ? totals.total : paidAmount,
                notes,
            });

            if (result.success) {
                onSuccess?.();
                onClose?.();
            } else {
                setError(result.error || 'Failed to create invoice');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Truck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Purchase Invoice</h2>
                                <p className="text-indigo-200 text-sm">Record goods received from supplier</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Supplier & Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Supplier Selection */}
                            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Supplier Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Supplier *</label>
                                        <select
                                            value={supplierId}
                                            onChange={(e) => setSupplierId(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Supplier Invoice No *</label>
                                        <input
                                            type="text"
                                            value={supplierInvoiceNo}
                                            onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                                            placeholder="e.g., INV-001"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Invoice Date</label>
                                        <input
                                            type="date"
                                            value={supplierInvoiceDate}
                                            onChange={(e) => setSupplierInvoiceDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Item Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search items by name, SKU, or HSN..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Item Grid */}
                            {searchQuery && (
                                <div className="bg-white border border-slate-200 rounded-xl p-2 max-h-48 overflow-auto">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-500">HSN: {item.hsnCode} | Stock: {item.stock}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-indigo-600">₹{item.purchasePrice}</p>
                                                <Plus className="w-4 h-4 text-indigo-600 ml-auto" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Cart Table */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Item</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Rate</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">GST</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>Search and add items to the invoice</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            cartItems.map(item => (
                                                <tr key={item.id} className="border-t border-slate-100">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-800">{item.name}</p>
                                                        <p className="text-xs text-slate-500">HSN: {item.hsnCode}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            min="1"
                                                            onChange={(e) => updateCartItem(item.itemId, parseInt(e.target.value) || 1)}
                                                            className="w-16 text-center px-2 py-1 rounded border border-slate-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => updateCartItem(item.itemId, item.quantity, parseFloat(e.target.value) || 0)}
                                                            className="w-24 text-right px-2 py-1 rounded border border-slate-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                                                        {item.gstRate}%
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold">
                                                        ₹{item.total.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => removeFromCart(item.itemId)}
                                                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="space-y-4">
                            {/* Totals */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
                                <h3 className="font-bold mb-4 flex items-center">
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Invoice Summary
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Sub Total</span>
                                        <span>₹{totals.subTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">CGST</span>
                                        <span>₹{totals.cgstTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">SGST</span>
                                        <span>₹{totals.sgstTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-emerald-400">₹{totals.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h3 className="font-bold text-slate-800 mb-3">Payment</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['cash', 'credit', 'upi', 'cheque'] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setPaymentMode(mode)}
                                            className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${paymentMode === mode
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                                                }`}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {paymentMode !== 'cash' && paymentMode !== 'credit' && (
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Amount Paid</label>
                                        <input
                                            type="number"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{isSubmitting ? 'Saving...' : 'Save Purchase Invoice'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseInvoice;
