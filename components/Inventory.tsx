import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, AlertTriangle, FileBarChart, Settings2, X,
  RefreshCw, Layers, TrendingUp, Package, Calendar, DollarSign,
  Archive, ChevronDown, ChevronUp
} from 'lucide-react';
import { Item, ItemVariant } from '../types';
import { inventoryService } from '../services/inventoryService';

interface Batch {
  id: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  manufacturingDate?: string;
  expiryDate?: string;
}

interface InventoryProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ items, setItems }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [adjustItem, setAdjustItem] = useState<Item | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showBatchModal, setShowBatchModal] = useState<Item | null>(null);
  const [showValuation, setShowValuation] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '', hsnCode: '', purchasePrice: 0, salePrice: 0, stock: 0, minStock: 5, unit: 'kg', gstRate: 5, variants: []
  });

  const [newBatch, setNewBatch] = useState<Partial<Batch>>({
    batchNumber: '', quantity: 0, purchasePrice: 0, manufacturingDate: '', expiryDate: ''
  });

  // Stock valuation using service
  const stockValuation = useMemo(() => inventoryService.getStockValuation(), [items]);

  // Low stock items
  const lowStockItems = useMemo(() => inventoryService.getLowStockItems(10), [items]);

  const handleSaveItem = () => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
      setEditingItem(null);
    } else if (newItem.name) {
      const item: Item = {
        id: Date.now().toString(),
        name: newItem.name!,
        hsnCode: newItem.hsnCode || 'N/A',
        purchasePrice: Number(newItem.purchasePrice) || 0,
        salePrice: Number(newItem.salePrice) || 0,
        stock: Number(newItem.stock) || 0,
        minStock: Number(newItem.minStock) || 0,
        unit: newItem.unit || 'pcs',
        gstRate: Number(newItem.gstRate) || 0,
        variants: newItem.variants || [],
        batches: []
      };

      // Record opening stock in ledger if stock > 0
      if (item.stock > 0) {
        setItems(prev => [...prev, item]);
        // The service will handle ledger entry via addStock
        inventoryService.addStock(
          item.id,
          item.stock,
          item.purchasePrice,
          'opening-' + item.id,
          'OPENING'
        );
      } else {
        setItems(prev => [...prev, item]);
      }

      setNewItem({ name: '', hsnCode: '', purchasePrice: 0, salePrice: 0, stock: 0, minStock: 5, unit: 'kg', gstRate: 5, variants: [] });
    }
    setShowAddModal(false);
  };

  const addVariantField = () => {
    const v: ItemVariant = { id: Date.now().toString(), name: '', stock: 0, purchasePrice: 0, salePrice: 0 };
    if (editingItem) {
      setEditingItem({ ...editingItem, variants: [...(editingItem.variants || []), v] });
    } else {
      setNewItem({ ...newItem, variants: [...(newItem.variants || []), v] });
    }
  };

  const updateVariant = (id: string, field: keyof ItemVariant, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        variants: editingItem.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
      });
    } else {
      setNewItem({
        ...newItem,
        variants: newItem.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
      });
    }
  };

  const removeVariant = (id: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, variants: editingItem.variants?.filter(v => v.id !== id) });
    } else {
      setNewItem({ ...newItem, variants: newItem.variants?.filter(v => v.id !== id) });
    }
  };

  const handleAdjustStock = () => {
    if (!adjustItem) return;

    // Use inventory service for audit trail
    const result = inventoryService.adjustStock(
      adjustItem.id,
      adjustItem.stock + adjustmentValue,
      adjustmentReason || 'Manual adjustment',
      'adjust-' + Date.now()
    );

    if (result.success) {
      setItems(prev => prev.map(i => i.id === adjustItem.id ? { ...i, stock: i.stock + adjustmentValue } : i));
    }

    setAdjustItem(null);
    setAdjustmentValue(0);
    setAdjustmentReason('');
  };

  const handleAddBatch = () => {
    if (!showBatchModal || !newBatch.batchNumber) return;

    const batch: Batch = {
      id: Date.now().toString(),
      batchNumber: newBatch.batchNumber!,
      quantity: Number(newBatch.quantity) || 0,
      purchasePrice: Number(newBatch.purchasePrice) || 0,
      manufacturingDate: newBatch.manufacturingDate,
      expiryDate: newBatch.expiryDate,
    };

    // Update item with new batch and stock
    setItems(prev => prev.map(i => {
      if (i.id === showBatchModal.id) {
        const existingBatches = (i as any).batches || [];
        return {
          ...i,
          stock: i.stock + batch.quantity,
          batches: [...existingBatches, batch]
        };
      }
      return i;
    }));

    // Record in stock ledger
    inventoryService.addStock(
      showBatchModal.id,
      batch.quantity,
      batch.purchasePrice,
      'batch-' + batch.id,
      batch.batchNumber
    );

    setNewBatch({ batchNumber: '', quantity: 0, purchasePrice: 0, manufacturingDate: '', expiryDate: '' });
    setShowBatchModal(null);
  };

  const calculateMargin = (item: Item) => {
    if (!item.salePrice || !item.purchasePrice) return 0;
    const profit = item.salePrice - item.purchasePrice;
    return ((profit / item.purchasePrice) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Engine</h1>
          <p className="text-slate-500 font-medium">Manage SKUs, batches, and track valuations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowValuation(!showValuation)}
            className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm ${showValuation ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Valuation
          </button>
          <button onClick={() => { setEditingItem(null); setShowAddModal(true); }} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100">
            <Plus className="w-5 h-5 mr-2" /> Add SKU
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><FileBarChart className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active SKUs</p><p className="text-2xl font-black text-slate-900">{items.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600"><AlertTriangle className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock</p><p className="text-2xl font-black text-slate-900">{lowStockItems.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><Package className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Units</p><p className="text-2xl font-black text-slate-900">{stockValuation.totalQuantity.toLocaleString()}</p></div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-[2rem] text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-2xl"><RefreshCw className="w-6 h-6" /></div>
            <div><p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Asset Value</p><p className="text-2xl font-black">₹{stockValuation.totalValue.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* Stock Valuation Panel */}
      {showValuation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
            Stock Valuation Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-bold">Total Items</p>
              <p className="text-xl font-black text-slate-800">{stockValuation.totalItems}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 font-bold">Total Quantity</p>
              <p className="text-xl font-black text-emerald-700">{stockValuation.totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-indigo-600 font-bold">Total Value (Cost)</p>
              <p className="text-xl font-black text-indigo-700">₹{stockValuation.totalValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            <Archive className="w-3 h-3 mr-1" />
            Valuation method: Weighted Average Cost
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">{lowStockItems.length} Items Low in Stock</p>
            <p className="text-sm text-amber-700">
              {lowStockItems.slice(0, 3).map(i => i.name).join(', ')}
              {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item / HSN</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI Margin</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => {
                const margin = Number(calculateMargin(item));
                const itemBatches = (item as any).batches || [];
                const isExpanded = expandedItem === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          <p className="font-black text-slate-900">{item.name}</p>
                          {item.variants && item.variants.length > 0 && <Layers className="w-3 h-3 text-indigo-400" />}
                          {itemBatches.length > 0 && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-[8px] font-bold">
                              {itemBatches.length} Batches
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{item.hsnCode}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg font-black ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{item.unit}</span>
                        </div>
                        {item.stock <= item.minStock && (
                          <p className="text-[10px] text-rose-500 font-bold">Below min: {item.minStock}</p>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-700">₹{(item.stock * item.purchasePrice).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">@₹{item.purchasePrice}/unit</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-tighter uppercase flex items-center ${margin > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            <TrendingUp className="w-3 h-3 mr-1" /> {margin}%
                          </span>
                          <span className="text-[9px] font-bold text-slate-300">₹{item.salePrice - item.purchasePrice}/unit</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right space-x-2">
                        {itemBatches.length > 0 && (
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => setShowBatchModal(item)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button onClick={() => setAdjustItem(item)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Settings2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingItem(item); setShowAddModal(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Batch Details Row */}
                    {isExpanded && itemBatches.length > 0 && (
                      <tr className="bg-purple-50/50">
                        <td colSpan={5} className="px-8 py-4">
                          <div className="text-xs font-bold text-purple-700 mb-2">Batch Details</div>
                          <div className="grid grid-cols-5 gap-3">
                            {itemBatches.map((batch: Batch) => (
                              <div key={batch.id} className="bg-white rounded-lg p-3 border border-purple-100">
                                <p className="font-bold text-slate-800 text-xs">{batch.batchNumber}</p>
                                <p className="text-[10px] text-slate-500">Qty: {batch.quantity}</p>
                                <p className="text-[10px] text-slate-500">@₹{batch.purchasePrice}</p>
                                {batch.expiryDate && (
                                  <p className="text-[10px] text-slate-400 flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Exp: {new Date(batch.expiryDate).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setAdjustItem(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Adjust Stock</h3>
            <p className="text-slate-500 text-sm mb-8">Manual correction for <b>{adjustItem.name}</b></p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Qty Correction (+/-)</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl" autoFocus value={adjustmentValue} onChange={(e) => setAdjustmentValue(Number(e.target.value))} />
                <p className="mt-2 text-[10px] font-bold text-slate-400">Resulting Stock: <span className="text-slate-900">{adjustItem.stock + adjustmentValue}</span></p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Damaged, Stock Count, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>
              <button onClick={handleAdjustStock} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100">Update Ledger</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowBatchModal(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Add New Batch</h3>
            <p className="text-slate-500 text-sm mb-8">For <b>{showBatchModal.name}</b></p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Batch Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                  placeholder="e.g., BATCH-2026-001"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Quantity</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-lg"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Purchase Price</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-lg text-rose-600"
                    value={newBatch.purchasePrice}
                    onChange={(e) => setNewBatch({ ...newBatch, purchasePrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Mfg Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                    value={newBatch.manufacturingDate}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturingDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <button onClick={handleAddBatch} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100">Add Batch</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 p-12 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-900">{editingItem ? 'Edit SKU' : 'New SKU'}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Name</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HSN Code</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="e.g., 0902" value={editingItem ? editingItem.hsnCode : newItem.hsnCode} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, hsnCode: e.target.value }) : setNewItem({ ...newItem, hsnCode: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit</label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  value={editingItem ? editingItem.unit : newItem.unit}
                  onChange={(e) => editingItem ? setEditingItem({ ...editingItem, unit: e.target.value }) : setNewItem({ ...newItem, unit: e.target.value })}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ltr">Liters (ltr)</option>
                  <option value="box">Box</option>
                  <option value="doz">Dozen</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Purchase Price (₹)</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl text-rose-600" value={editingItem ? editingItem.purchasePrice : newItem.purchasePrice} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, purchasePrice: Number(e.target.value) }) : setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sale Price (₹)</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl text-indigo-600" value={editingItem ? editingItem.salePrice : newItem.salePrice} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, salePrice: Number(e.target.value) }) : setNewItem({ ...newItem, salePrice: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Opening Stock</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl" value={editingItem ? editingItem.stock : newItem.stock} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, stock: Number(e.target.value) }) : setNewItem({ ...newItem, stock: Number(e.target.value) })} />
                <p className="text-[10px] text-slate-400 mt-1">Initial stock will be recorded in ledger</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Stock Level</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl" value={editingItem ? editingItem.minStock : newItem.minStock} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, minStock: Number(e.target.value) }) : setNewItem({ ...newItem, minStock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GST Rate (%)</label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl"
                  value={editingItem ? editingItem.gstRate : newItem.gstRate}
                  onChange={(e) => editingItem ? setEditingItem({ ...editingItem, gstRate: Number(e.target.value) }) : setNewItem({ ...newItem, gstRate: Number(e.target.value) })}
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>

              {/* Variants Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-indigo-600" /> Variants (Size, Color, etc)
                  </h4>
                  <button onClick={addVariantField} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Add Variant</button>
                </div>
                <div className="space-y-3">
                  {(editingItem ? editingItem.variants : newItem.variants)?.map((v) => (
                    <div key={v.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <button onClick={() => removeVariant(v.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                      <div className="sm:col-span-1">
                        <input placeholder="Name (Red, XL)" className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none" value={v.name} onChange={(e) => updateVariant(v.id, 'name', e.target.value)} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-bold text-slate-400">Stock</span>
                        <input type="number" className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none" value={v.stock} onChange={(e) => updateVariant(v.id, 'stock', Number(e.target.value))} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-bold text-slate-400">Price</span>
                        <input type="number" className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg outline-none text-indigo-600" value={v.salePrice} onChange={(e) => updateVariant(v.id, 'salePrice', Number(e.target.value))} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <button onClick={handleSaveItem} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all">Save SKU</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
