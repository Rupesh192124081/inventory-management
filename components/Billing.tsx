import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Trash2, Printer, UserPlus, ShoppingCart, CreditCard,
  Wallet, Banknote, PackageOpen, X, CheckCircle2, ArrowDownCircle,
  ArrowUpCircle, LayoutGrid, List, Layers, Scan, AlertTriangle,
  RotateCcw, RefreshCw
} from 'lucide-react';
import { Item, Party, Invoice, InvoiceItem, BusinessProfile, ItemVariant } from '../types';
import { billingService } from '../services/billingService';

interface BillingProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  profile: BusinessProfile;
}

const Billing: React.FC<BillingProps> = ({ items, setItems, parties, setParties, invoices, setInvoices, profile }) => {
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'credit' | 'partial'>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [billType, setBillType] = useState<'sale' | 'purchase' | 'return'>('sale');
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');

  const [pickingVariantItem, setPickingVariantItem] = useState<Item | null>(null);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnInvoiceId, setReturnInvoiceId] = useState('');

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const totalDiscount = itemDiscounts + globalDiscount;
    const tax = cart.reduce((sum, item) => sum + item.taxAmount, 0);
    const grand = subTotal - totalDiscount + tax;
    return { subTotal, itemDiscounts, totalDiscount, tax, grand };
  }, [cart, globalDiscount]);

  // Check credit limit when party or total changes
  const checkCreditLimit = () => {
    if (!selectedPartyId || paymentMode === 'cash') {
      setCreditWarning(null);
      return true;
    }

    const result = billingService.validateCreditLimit(selectedPartyId, totals.grand - paidAmount);
    if (!result.allowed) {
      setCreditWarning(result.message);
      return false;
    }
    setCreditWarning(null);
    return true;
  };

  const addToCart = (item: Item, variant?: ItemVariant) => {
    const stockToUse = variant ? variant.stock : item.stock;
    const priceToUse = variant ? (billType === 'sale' ? variant.salePrice : variant.purchasePrice) : (billType === 'sale' ? item.salePrice : item.purchasePrice);

    if (billType === 'sale' && stockToUse <= 0) return alert('Out of stock!');

    const cartKey = variant ? `${item.id}-${variant.id}` : item.id;
    const existingIndex = cart.findIndex(i => (i.variantId ? `${i.itemId}-${i.variantId}` : i.itemId) === cartKey);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      updateCartItem(item.id, existing.quantity + 1, existing.price, existing.discount, variant?.id);
    } else {
      const taxableAmount = priceToUse / (1 + item.gstRate / 100);
      const taxAmount = priceToUse - taxableAmount;
      setCart([...cart, {
        itemId: item.id,
        variantId: variant?.id,
        variantName: variant?.name,
        name: variant ? `${item.name} (${variant.name})` : item.name,
        quantity: 1,
        price: priceToUse,
        gstRate: item.gstRate,
        discount: 0,
        taxableAmount,
        taxAmount,
        total: priceToUse
      }]);
    }
    setPickingVariantItem(null);
    setBarcodeInput('');
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.hsnCode === barcodeInput || i.id === barcodeInput);
    if (item) {
      if (item.variants && item.variants.length > 0) {
        setPickingVariantItem(item);
      } else {
        addToCart(item);
      }
    } else {
      alert('Product not found in catalog');
    }
    setBarcodeInput('');
  };

  const handleItemClick = (item: Item) => {
    if (item.variants && item.variants.length > 0) {
      setPickingVariantItem(item);
    } else {
      addToCart(item);
    }
  };

  const updateCartItem = (itemId: string, qty: number, price: number, discount: number = 0, variantId?: string) => {
    if (qty <= 0) {
      setCart(cart.filter(i => !(i.itemId === itemId && i.variantId === variantId)));
      return;
    }

    const itemRef = items.find(i => i.id === itemId);
    if (!itemRef) return;

    const stockToCompare = variantId
      ? itemRef.variants?.find(v => v.id === variantId)?.stock
      : itemRef.stock;

    if (billType === 'sale' && stockToCompare !== undefined && qty > stockToCompare) return alert('Insufficient stock');

    setCart(cart.map(item => {
      if (item.itemId === itemId && item.variantId === variantId) {
        const itemSubtotal = (qty * price) - discount;
        const newTaxable = itemSubtotal / (1 + item.gstRate / 100);
        const newTax = itemSubtotal - newTaxable;
        return {
          ...item,
          quantity: qty,
          price,
          discount,
          taxableAmount: newTaxable,
          taxAmount: newTax,
          total: itemSubtotal + newTax
        };
      }
      return item;
    }));
  };

  // Create return invoice from existing sale
  const handleCreateReturn = () => {
    const originalInvoice = invoices.find(i => i.id === returnInvoiceId && i.type === 'sale');
    if (!originalInvoice) {
      alert('Sale invoice not found');
      return;
    }

    // Set cart items from original invoice
    setCart(originalInvoice.items.map(item => ({
      ...item,
      // Reverse quantities for return
    })));
    setSelectedPartyId(originalInvoice.partyId);
    setBillType('return');
    setShowReturnModal(false);
    setReturnInvoiceId('');
  };

  const handleFinalize = () => {
    if (!selectedPartyId && paymentMode !== 'cash') return alert('Select a party for Credit/Mixed payments');

    // Credit limit check
    if (paymentMode !== 'cash' && !checkCreditLimit()) {
      return alert(creditWarning || 'Credit limit exceeded');
    }

    // Calculate loyalty points (1% of total for sales only)
    const pointsEarned = billType === 'sale' ? Math.floor(totals.grand * 0.01) : 0;

    // Calculate partial payment status
    let status: 'paid' | 'unpaid' | 'partial' = 'unpaid';
    let actualPaidAmount = 0;

    if (paymentMode === 'cash') {
      status = 'paid';
      actualPaidAmount = totals.grand;
    } else if (paymentMode === 'partial') {
      if (paidAmount >= totals.grand) {
        status = 'paid';
        actualPaidAmount = totals.grand;
      } else if (paidAmount > 0) {
        status = 'partial';
        actualPaidAmount = paidAmount;
      } else {
        status = 'unpaid';
        actualPaidAmount = 0;
      }
    } else {
      // Full credit
      status = 'unpaid';
      actualPaidAmount = 0;
    }

    const newInvoice: Invoice = {
      id: `${billType === 'sale' ? 'INV' : billType === 'purchase' ? 'PUR' : 'RET'}-${Date.now()}`,
      partyId: selectedPartyId || 'CASH-WALKIN',
      date: new Date().toISOString(),
      type: billType,
      items: cart,
      subTotal: totals.subTotal,
      discountTotal: totals.totalDiscount,
      totalAmount: totals.grand,
      taxAmount: totals.tax,
      paymentMode,
      paidAmount: actualPaidAmount,
      status,
      pointsEarned
    };

    // Update stock based on bill type
    setItems(prev => prev.map(i => {
      const itemsInCart = cart.filter(ci => ci.itemId === i.id);
      if (itemsInCart.length === 0) return i;

      let updatedItem = { ...i };
      if (i.variants && i.variants.length > 0) {
        updatedItem.variants = i.variants.map(v => {
          const cartVar = itemsInCart.find(ci => ci.variantId === v.id);
          if (!cartVar) return v;

          // Sale/Return: deduct/add; Purchase: add
          let stockChange = 0;
          if (billType === 'sale') stockChange = -cartVar.quantity;
          else if (billType === 'purchase') stockChange = cartVar.quantity;
          else if (billType === 'return') stockChange = cartVar.quantity; // Return adds stock back

          return {
            ...v,
            stock: v.stock + stockChange
          };
        });
      }
      const totalItemQty = itemsInCart.reduce((sum, c) => sum + c.quantity, 0);

      // Apply stock change based on bill type
      let stockChange = 0;
      if (billType === 'sale') stockChange = -totalItemQty;
      else if (billType === 'purchase') stockChange = totalItemQty;
      else if (billType === 'return') stockChange = totalItemQty; // Return adds stock back

      updatedItem.stock = updatedItem.stock + stockChange;
      return updatedItem;
    }));

    // Update party balance
    if (selectedPartyId) {
      setParties(prev => prev.map(p => {
        if (p.id !== selectedPartyId) return p;
        const due = totals.grand - actualPaidAmount;

        let balanceChange = 0;
        if (billType === 'sale') balanceChange = due;
        else if (billType === 'purchase') balanceChange = -due;
        else if (billType === 'return') balanceChange = -totals.grand; // Return reduces balance

        return {
          ...p,
          balance: p.balance + balanceChange,
          loyaltyPoints: (p.loyaltyPoints || 0) + pointsEarned
        };
      }));
    }

    setInvoices(prev => [newInvoice, ...prev]);
    setCart([]);
    setSelectedPartyId('');
    setGlobalDiscount(0);
    setPaidAmount(0);
    setShowPreview(false);
    setCreditWarning(null);

    const actionText = billType === 'sale' ? 'Sale' : billType === 'purchase' ? 'Purchase' : 'Return';
    alert(`${actionText} posted successfully. ${billType === 'sale' ? `Points earned: ${pointsEarned}` : ''}`);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedParty = parties.find(p => p.id === selectedPartyId);
  const partyCredit = selectedParty ? ((selectedParty as any).creditLimit || 0) : 0;
  const partyBalance = selectedParty ? selectedParty.balance : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 animate-in fade-in duration-500">

      <div className="lg:hidden flex bg-white p-1 rounded-2xl border border-slate-200">
        <button onClick={() => setMobileView('catalog')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${mobileView === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Catalog</button>
        <button onClick={() => setMobileView('cart')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${mobileView === 'cart' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Cart ({cart.length})</button>
      </div>

      <div className={`flex-1 flex flex-col space-y-4 min-h-0 ${mobileView === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-3xl border border-slate-200">
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input type="text" placeholder="Scan Barcode / ID..." className="w-full pl-10 pr-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs outline-none font-black text-indigo-700" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} />
          </form>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search product name..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => { setBillType('sale'); setCart([]); }} className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${billType === 'sale' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Sales</button>
            <button onClick={() => { setBillType('purchase'); setCart([]); }} className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${billType === 'purchase' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>Inward</button>
            <button onClick={() => setShowReturnModal(true)} className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${billType === 'return' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>Return</button>
          </div>
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none" value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)}>
            <option value="">{billType === 'sale' ? 'Walk-in' : 'Select Vendor'}</option>
            {parties.filter(p => billType === 'sale' || billType === 'return' ? p.type === 'customer' : p.type === 'vendor').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Credit Info Banner */}
        {selectedParty && partyCredit > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase">Credit Limit</p>
                <p className="text-sm font-black text-indigo-700">₹{partyCredit.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Outstanding</p>
              <p className={`text-sm font-black ${partyBalance > partyCredit * 0.8 ? 'text-rose-600' : 'text-slate-700'}`}>
                ₹{partyBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
              <p className="text-sm font-black text-emerald-600">₹{Math.max(0, partyCredit - partyBalance).toLocaleString()}</p>
            </div>
          </div>
        )}

        {creditWarning && (
          <div className="flex items-center space-x-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <p className="text-xs font-bold text-rose-700">{creditWarning}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <button key={item.id} onClick={() => handleItemClick(item)} className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-600 hover:shadow-xl transition-all group relative">
                <div className="absolute top-3 right-3">{item.variants && item.variants.length > 0 ? <Layers className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-slate-200" />}</div>
                <h4 className="font-black text-slate-900 text-xs truncate pr-4">{item.name}</h4>
                <div className="mt-4 flex flex-col">
                  <span className="text-lg font-black text-indigo-600">{profile.currency}{billType === 'sale' || billType === 'return' ? item.salePrice : item.purchasePrice}</span>
                  <span className={`text-[8px] font-black uppercase ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-400'}`}>Stock: {item.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`lg:w-[400px] flex flex-col space-y-4 ${mobileView === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center text-sm">
              {billType === 'return' ? <RotateCcw className="w-4 h-4 mr-2 text-rose-600" /> : <ShoppingCart className="w-4 h-4 mr-2 text-indigo-600" />}
              {billType === 'return' ? 'Return Items' : 'Checkout Bag'}
            </h3>
            {selectedParty && (
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[8px] font-black uppercase">Loyalty: {selectedParty.loyaltyPoints || 0} pts</div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-10">
                <PackageOpen className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bag is Empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={`${item.itemId}-${item.variantId || 'base'}`} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs truncate max-w-[200px]">{item.name}</span>
                      {item.variantName && <span className="text-[8px] font-bold text-indigo-400 uppercase">Var: {item.variantName}</span>}
                    </div>
                    <button onClick={() => updateCartItem(item.itemId, 0, item.price, 0, item.variantId)} className="text-slate-300 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                      <button onClick={() => updateCartItem(item.itemId, item.quantity - 1, item.price, item.discount, item.variantId)} className="w-7 h-7 flex items-center justify-center">-</button>
                      <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.itemId, item.quantity + 1, item.price, item.discount, item.variantId)} className="w-7 h-7 flex items-center justify-center">+</button>
                    </div>
                    <span className="font-black text-slate-900 text-xs">{profile.currency}{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white space-y-4">
            <div className="space-y-2 text-xs font-bold text-slate-400 uppercase">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900 font-black">{profile.currency}{totals.subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-600"><span>Estimated Tax</span><span>+{profile.currency}{totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-black text-slate-900 mt-2 border-t pt-2"><span>Total {billType === 'return' ? 'Refund' : 'Pay'}</span><span className={billType === 'return' ? 'text-rose-600' : 'text-indigo-600'}>{profile.currency}{totals.grand.toFixed(2)}</span></div>
              {billType === 'sale' && <div className="text-[8px] font-bold text-indigo-400 italic">Earning ~{Math.floor(totals.grand * 0.01)} loyalty points</div>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['cash', 'credit', 'partial'].map(mode => (
                <button key={mode} onClick={() => setPaymentMode(mode as any)} className={`py-3 rounded-xl border-2 flex flex-col items-center transition-all ${paymentMode === mode ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-300'}`}>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{mode}</span>
                </button>
              ))}
            </div>

            {/* Partial Payment Input */}
            {paymentMode === 'partial' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Amount Paid Now</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-lg text-emerald-600"
                  placeholder="Enter amount..."
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Balance Due: <span className="font-bold text-rose-600">₹{Math.max(0, totals.grand - paidAmount).toLocaleString()}</span>
                </p>
              </div>
            )}

            <button onClick={() => cart.length > 0 && setShowPreview(true)} disabled={cart.length === 0} className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all ${billType === 'return' ? 'bg-rose-600 text-white shadow-rose-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
              {billType === 'return' ? 'Process Return' : 'Generate Receipt'}
            </button>
          </div>
        </div>
      </div>

      {pickingVariantItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setPickingVariantItem(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Variant</h3>
              <button onClick={() => setPickingVariantItem(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-2">
              {pickingVariantItem.variants?.map((v) => (
                <button key={v.id} onClick={() => addToCart(pickingVariantItem, v)} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-600 hover:bg-white transition-all">
                  <div className="text-left"><p className="font-black text-slate-900 text-xs">{v.name}</p><p className="text-[8px] font-bold text-slate-400">Stock: {v.stock}</p></div>
                  <div className="text-right"><p className="font-black text-indigo-600 text-sm">₹{billType === 'sale' || billType === 'return' ? v.salePrice : v.purchasePrice}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Return Invoice Selection Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowReturnModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Create Return</h3>
              <button onClick={() => setShowReturnModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Original Invoice ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                  placeholder="Enter invoice ID (e.g., INV-123456)"
                  value={returnInvoiceId}
                  onChange={(e) => setReturnInvoiceId(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400">Recent sale invoices:</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {invoices.filter(i => i.type === 'sale').slice(0, 5).map(inv => (
                  <button
                    key={inv.id}
                    onClick={() => setReturnInvoiceId(inv.id)}
                    className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all ${returnInvoiceId === inv.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-xs">{inv.id}</p>
                      <p className="text-[10px] text-slate-400">{new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-black text-slate-700">₹{inv.totalAmount.toLocaleString()}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateReturn}
                disabled={!returnInvoiceId}
                className="w-full py-4 bg-rose-600 text-white rounded-xl font-black disabled:opacity-50"
              >
                Load Invoice for Return
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowPreview(false)}></div>
          <div className="bg-white w-full max-w-2xl h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-widest">Final Summary</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between mb-8 border-b border-slate-50 pb-8">
                  <div>
                    <h2 className="text-xl font-black text-indigo-600">{profile.name}</h2>
                    <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">{profile.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black uppercase tracking-widest text-xs ${billType === 'return' ? 'text-rose-600' : 'text-slate-900'}`}>{billType}</p>
                    <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-6 flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Payment Mode</p>
                    <p className="font-black text-slate-800 capitalize">{paymentMode}</p>
                  </div>
                  {paymentMode === 'partial' && (
                    <>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Paid Now</p>
                        <p className="font-black text-emerald-700">₹{paidAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-rose-600 uppercase">Balance Due</p>
                        <p className="font-black text-rose-700">₹{Math.max(0, totals.grand - paidAmount).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>

                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-50 border-y border-slate-100"><tr className="font-black text-slate-500">
                    <th className="p-3">Item</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">{cart.map((item, i) => (
                    <tr key={i}><td className="p-3 font-bold">{item.name}</td><td className="p-3 text-center">{item.quantity}</td><td className="p-3 text-right font-black">{profile.currency}{item.total.toFixed(2)}</td></tr>
                  ))}</tbody>
                </table>

                <div className="flex justify-end pt-8"><div className="w-64 space-y-2">
                  <div className={`flex justify-between text-lg font-black border-t-2 pt-4 ${billType === 'return' ? 'text-rose-600 border-rose-600' : 'text-slate-900 border-slate-900'}`}><span>Total {billType === 'return' ? 'Refund' : 'Due'}</span><span>{profile.currency}{totals.grand.toFixed(2)}</span></div>
                  {billType === 'sale' && <div className="text-[10px] text-indigo-600 font-bold text-right italic">+ {Math.floor(totals.grand * 0.01)} Loyalty Points</div>}
                </div></div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <button onClick={handleFinalize} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl flex items-center justify-center transition-all ${billType === 'sale' ? 'bg-indigo-600' : billType === 'purchase' ? 'bg-amber-500' : 'bg-rose-600'}`}>
                <CheckCircle2 className="w-5 h-5 mr-3" /> Post Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
