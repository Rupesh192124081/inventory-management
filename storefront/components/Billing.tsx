
import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Printer, UserPlus, ShoppingCart, CreditCard, Wallet, Banknote, PackageOpen, X, CheckCircle2, ArrowDownCircle, ArrowUpCircle, LayoutGrid, List, Layers, Scan } from 'lucide-react';
import { Item, Party, Invoice, InvoiceItem, BusinessProfile, ItemVariant } from '../types/admin';

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
  const [billType, setBillType] = useState<'sale' | 'purchase'>('sale');
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');
  
  const [pickingVariantItem, setPickingVariantItem] = useState<Item | null>(null);

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const totalDiscount = itemDiscounts + globalDiscount;
    const tax = cart.reduce((sum, item) => sum + item.taxAmount, 0);
    const grand = subTotal - totalDiscount + tax;
    return { subTotal, itemDiscounts, totalDiscount, tax, grand };
  }, [cart, globalDiscount]);

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
      const taxableAmount = priceToUse / (1 + item.gstRate/100);
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

  const handleFinalize = () => {
    if (!selectedPartyId && paymentMode !== 'cash') return alert('Select a party for Credit/Mixed payments');
    
    // Calculate loyalty points (1% of total)
    const pointsEarned = billType === 'sale' ? Math.floor(totals.grand * 0.01) : 0;

    const newInvoice: Invoice = {
      id: `${billType === 'sale' ? 'INV' : 'PUR'}-${Date.now()}`,
      partyId: selectedPartyId || 'CASH-WALKIN',
      date: new Date().toISOString(),
      type: billType,
      items: cart,
      subTotal: totals.subTotal,
      discountTotal: totals.totalDiscount,
      totalAmount: totals.grand,
      taxAmount: totals.tax,
      paymentMode,
      paidAmount: paymentMode === 'cash' ? totals.grand : paidAmount,
      status: paymentMode === 'cash' ? 'paid' : (paidAmount >= totals.grand ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid')),
      pointsEarned
    };

    setItems(prev => prev.map(i => {
      const itemsInCart = cart.filter(ci => ci.itemId === i.id);
      if (itemsInCart.length === 0) return i;
      
      let updatedItem = { ...i };
      if (i.variants && i.variants.length > 0) {
        updatedItem.variants = i.variants.map(v => {
          const cartVar = itemsInCart.find(ci => ci.variantId === v.id);
          if (!cartVar) return v;
          return {
            ...v,
            stock: billType === 'sale' ? v.stock - cartVar.quantity : v.stock + cartVar.quantity
          };
        });
      }
      const totalItemQty = itemsInCart.reduce((sum, c) => sum + c.quantity, 0);
      updatedItem.stock = billType === 'sale' ? updatedItem.stock - totalItemQty : updatedItem.stock + totalItemQty;
      return updatedItem;
    }));

    if (selectedPartyId) {
      setParties(prev => prev.map(p => {
        if (p.id !== selectedPartyId) return p;
        const due = totals.grand - paidAmount;
        const balanceChange = billType === 'sale' ? due : -due;
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
    alert(`${billType === 'sale' ? 'Sale' : 'Purchase'} posted. Points earned: ${pointsEarned}`);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedParty = parties.find(p => p.id === selectedPartyId);

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
              <button onClick={() => setBillType('sale')} className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${billType === 'sale' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Sales</button>
              <button onClick={() => setBillType('purchase')} className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${billType === 'purchase' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>Inward</button>
           </div>
           <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none" value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)}>
             <option value="">{billType === 'sale' ? 'Walk-in' : 'Select Vendor'}</option>
             {parties.filter(p => billType === 'sale' ? p.type === 'customer' : p.type === 'vendor').map(p => (
               <option key={p.id} value={p.id}>{p.name}</option>
             ))}
           </select>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <button key={item.id} onClick={() => handleItemClick(item)} className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-600 hover:shadow-xl transition-all group relative">
                  <div className="absolute top-3 right-3">{item.variants && item.variants.length > 0 ? <Layers className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-slate-200" />}</div>
                  <h4 className="font-black text-slate-900 text-xs truncate pr-4">{item.name}</h4>
                  <div className="mt-4 flex flex-col">
                    <span className="text-lg font-black text-indigo-600">{profile.currency}{billType === 'sale' ? item.salePrice : item.purchasePrice}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400">Stock: {item.stock}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className={`lg:w-[400px] flex flex-col space-y-4 ${mobileView === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
         <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-black text-slate-900 flex items-center text-sm"><ShoppingCart className="w-4 h-4 mr-2 text-indigo-600" /> Checkout Bag</h3>
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
                  <div className="flex justify-between text-lg font-black text-slate-900 mt-2 border-t pt-2"><span>Total Pay</span><span className="text-indigo-600">{profile.currency}{totals.grand.toFixed(2)}</span></div>
                  {billType === 'sale' && <div className="text-[8px] font-bold text-indigo-400 italic">Earning ~{Math.floor(totals.grand * 0.01)} loyalty points</div>}
               </div>

               <div className="grid grid-cols-3 gap-2">
                  {['cash', 'credit', 'partial'].map(mode => (
                    <button key={mode} onClick={() => setPaymentMode(mode as any)} className={`py-3 rounded-xl border-2 flex flex-col items-center transition-all ${paymentMode === mode ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-300'}`}>
                       <span className="text-[8px] font-black uppercase tracking-tighter">{mode}</span>
                    </button>
                  ))}
               </div>

               <button onClick={() => cart.length > 0 && setShowPreview(true)} disabled={cart.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-[1.02] disabled:opacity-50 transition-all">
                 Generate Receipt
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
                   <div className="text-right"><p className="font-black text-indigo-600 text-sm">₹{billType === 'sale' ? v.salePrice : v.purchasePrice}</p></div>
                 </button>
               ))}
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
                        <p className="font-black text-slate-900 uppercase tracking-widest text-xs">{billType}</p>
                        <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                      </div>
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
                      <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-900 pt-4"><span>Total Due</span><span>{profile.currency}{totals.grand.toFixed(2)}</span></div>
                      {billType === 'sale' && <div className="text-[10px] text-indigo-600 font-bold text-right italic">+ {Math.floor(totals.grand * 0.01)} Loyalty Points</div>}
                   </div></div>
                </div>
             </div>

             <div className="p-6 bg-white border-t border-slate-100">
                <button onClick={handleFinalize} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl flex items-center justify-center transition-all ${billType === 'sale' ? 'bg-indigo-600' : 'bg-amber-500'}`}>
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
