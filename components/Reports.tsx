import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, FileSpreadsheet, FileText,
  Download, Calendar, PackageOpen, Users, Building2, AlertTriangle,
  ArrowUpRight, ArrowDownLeft, Clock, DollarSign
} from 'lucide-react';
import { Item, Invoice, Party, Expense } from '../types';
import { inventoryService } from '../services/inventoryService';
import { paymentService } from '../services/paymentService';

interface ReportsProps {
  items: Item[];
  invoices: Invoice[];
  parties: Party[];
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ items, invoices, parties, expenses }) => {
  const [activeReport, setActiveReport] = useState<'pl' | 'stock' | 'analytics'>('pl');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Calculate P&L
  const totals = useMemo(() => ({
    sales: invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0),
    purchases: invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.totalAmount, 0),
    returns: invoices.filter(i => i.type === 'return').reduce((sum, i) => sum + i.totalAmount, 0),
  }), [invoices]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = totals.sales - totals.purchases - totals.returns;
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totals.sales > 0 ? (grossProfit / totals.sales * 100) : 0;
  const netMargin = totals.sales > 0 ? (netProfit / totals.sales * 100) : 0;

  // Stock valuation
  const stockValuation = useMemo(() => inventoryService.getStockValuation(), [items]);

  // Stock aging (items with old stock)
  const stockAging = useMemo(() => {
    return items
      .filter(i => i.stock > 0)
      .map(item => {
        const ledger = inventoryService.getItemLedger(item.id);
        const lastPurchase = ledger.find(e => e.type === 'in');
        const ageInDays = lastPurchase
          ? Math.floor((Date.now() - new Date(lastPurchase.date).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return {
          ...item,
          ageInDays,
          value: item.stock * item.purchasePrice,
        };
      })
      .sort((a, b) => b.ageInDays - a.ageInDays);
  }, [items]);

  // Low stock items
  const lowStock = useMemo(() => inventoryService.getLowStockItems(10), [items]);

  // Party analytics
  const partyAnalytics = useMemo(() => {
    const customers = parties.filter(p => p.type === 'customer' || p.type === 'both');
    const suppliers = parties.filter(p => p.type === 'supplier' || p.type === 'both');

    // Top customers by invoice value
    const customerSales = customers.map(c => {
      const sales = invoices
        .filter(i => i.type === 'sale' && i.partyId === c.id)
        .reduce((sum, i) => sum + i.totalAmount, 0);
      return { ...c, sales };
    }).sort((a, b) => b.sales - a.sales).slice(0, 5);

    // Top suppliers by purchase value
    const supplierPurchases = suppliers.map(s => {
      const purchases = invoices
        .filter(i => i.type === 'purchase' && i.partyId === s.id)
        .reduce((sum, i) => sum + i.totalAmount, 0);
      return { ...s, purchases };
    }).sort((a, b) => b.purchases - a.purchases).slice(0, 5);

    return { customerSales, supplierPurchases, totalCustomers: customers.length, totalSuppliers: suppliers.length };
  }, [parties, invoices]);

  // Outstanding summary
  const receivables = useMemo(() => paymentService.getTotalReceivables(), []);
  const payables = useMemo(() => paymentService.getTotalPayables(), []);

  // Export CSV
  const exportCSV = (type: string) => {
    let csv = '';
    let filename = '';

    if (type === 'pl') {
      csv = 'Description,Amount\n';
      csv += `Sales,${totals.sales}\n`;
      csv += `Purchases,${totals.purchases}\n`;
      csv += `Returns,${totals.returns}\n`;
      csv += `Expenses,${totalExpenses}\n`;
      csv += `Gross Profit,${grossProfit}\n`;
      csv += `Net Profit,${netProfit}\n`;
      filename = 'profit_loss_report.csv';
    } else if (type === 'stock') {
      csv = 'Item,SKU,Stock,Purchase Price,Value,Age (Days)\n';
      stockAging.forEach(item => {
        csv += `"${item.name}","${item.sku}",${item.stock},${item.purchasePrice},${item.value},${item.ageInDays}\n`;
      });
      filename = 'stock_aging_report.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Get aging bucket color
  const getAgingColor = (days: number) => {
    if (days <= 30) return 'text-emerald-600';
    if (days <= 60) return 'text-amber-600';
    if (days <= 90) return 'text-orange-600';
    return 'text-rose-600';
  };

  const getAgingBgColor = (days: number) => {
    if (days <= 30) return 'bg-emerald-100';
    if (days <= 60) return 'bg-amber-100';
    if (days <= 90) return 'bg-orange-100';
    return 'bg-rose-100';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Business Reports</h1>
          <p className="text-slate-500">Comprehensive financial and inventory analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-200 uppercase">Total Sales</p>
              <p className="text-3xl font-black mt-1">₹{totals.sales.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-200 uppercase">Total Purchases</p>
              <p className="text-3xl font-black mt-1">₹{totals.purchases.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-10 h-10 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase">Net Profit</p>
              <p className={`text-3xl font-black mt-1`}>₹{netProfit.toLocaleString()}</p>
              <p className="text-xs text-indigo-200 mt-1">{netMargin.toFixed(1)}% margin</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase">Stock Value</p>
              <p className="text-3xl font-black mt-1">₹{stockValuation.totalValue.toLocaleString()}</p>
              <p className="text-xs text-amber-200 mt-1">{stockValuation.totalItems} items</p>
            </div>
            <PackageOpen className="w-10 h-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
            { id: 'stock', label: 'Stock Aging', icon: PackageOpen },
            { id: 'analytics', label: 'Party Analytics', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex-1 py-4 text-center font-bold transition-colors flex items-center justify-center ${activeReport === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* P&L Report */}
          {activeReport === 'pl' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Profit & Loss Statement</h3>
                <button
                  onClick={() => exportCSV('pl')}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                {/* Revenue */}
                <div className="pb-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Revenue</h4>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Sales Revenue</span>
                    <span className="font-bold text-emerald-600">₹{totals.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Less: Sales Returns</span>
                    <span className="font-bold text-rose-600">-₹{totals.returns.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-2">
                    <span className="font-bold text-slate-700">Net Revenue</span>
                    <span className="font-black text-slate-800">₹{(totals.sales - totals.returns).toLocaleString()}</span>
                  </div>
                </div>

                {/* Cost of Goods */}
                <div className="pb-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Cost of Goods Sold</h4>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Purchases</span>
                    <span className="font-bold text-rose-600">₹{totals.purchases.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-2">
                    <span className="font-bold text-slate-700">Gross Profit</span>
                    <span className={`font-black ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₹{grossProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gross Margin: {grossMargin.toFixed(1)}%
                  </div>
                </div>

                {/* Operating Expenses */}
                <div className="pb-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Operating Expenses</h4>
                  {expenses.length > 0 ? (
                    expenses.slice(0, 5).map((exp, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <span className="text-slate-600">{exp.category}</span>
                        <span className="font-bold text-slate-700">₹{exp.amount.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 py-2">No expenses recorded</p>
                  )}
                  <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-2">
                    <span className="font-bold text-slate-700">Total Expenses</span>
                    <span className="font-bold text-slate-700">₹{totalExpenses.toLocaleString()}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-indigo-200 text-sm">Net Profit</span>
                      <p className="text-3xl font-black">₹{netProfit.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-200 text-sm">Net Margin</p>
                      <p className="text-xl font-bold">{netMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Aging Report */}
          {activeReport === 'stock' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Stock Aging Report</h3>
                <button
                  onClick={() => exportCSV('stock')}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>

              {/* Aging Buckets */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: '0-30 Days', color: 'emerald', count: stockAging.filter(i => i.ageInDays <= 30).length },
                  { label: '31-60 Days', color: 'amber', count: stockAging.filter(i => i.ageInDays > 30 && i.ageInDays <= 60).length },
                  { label: '61-90 Days', color: 'orange', count: stockAging.filter(i => i.ageInDays > 60 && i.ageInDays <= 90).length },
                  { label: '90+ Days', color: 'rose', count: stockAging.filter(i => i.ageInDays > 90).length },
                ].map((bucket, i) => (
                  <div key={i} className={`bg-${bucket.color}-50 border border-${bucket.color}-200 rounded-xl p-4`}>
                    <p className={`text-xs font-bold text-${bucket.color}-600 uppercase`}>{bucket.label}</p>
                    <p className={`text-2xl font-black text-${bucket.color}-700 mt-1`}>{bucket.count}</p>
                    <p className="text-xs text-slate-500">items</p>
                  </div>
                ))}
              </div>

              {/* Low Stock Alert */}
              {lowStock.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800">{lowStock.length} Items Low in Stock</p>
                    <p className="text-sm text-amber-700">
                      {lowStock.slice(0, 3).map(i => i.name).join(', ')}
                      {lowStock.length > 3 && ` and ${lowStock.length - 3} more`}
                    </p>
                  </div>
                </div>
              )}

              {/* Stock Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">Value</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAging.slice(0, 15).map((item, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 text-right">{item.stock} {item.unit}</td>
                        <td className="px-4 py-3 text-right font-bold">₹{item.value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getAgingBgColor(item.ageInDays)} ${getAgingColor(item.ageInDays)}`}>
                            {item.ageInDays}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Party Analytics */}
          {activeReport === 'analytics' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800">Vendor & Customer Analytics</h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-indigo-600 uppercase">Total Customers</p>
                  <p className="text-2xl font-black text-indigo-700 mt-1">{partyAnalytics.totalCustomers}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-purple-600 uppercase">Total Suppliers</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">{partyAnalytics.totalSuppliers}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Receivables</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">₹{receivables.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-rose-600 uppercase">Payables</p>
                  <p className="text-2xl font-black text-rose-700 mt-1">₹{payables.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customers */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 font-bold text-emerald-700 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Top Customers by Sales
                  </div>
                  <div className="divide-y divide-slate-100">
                    {partyAnalytics.customerSales.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">No customer data</div>
                    ) : (
                      partyAnalytics.customerSales.map((c, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.phone}</p>
                            </div>
                          </div>
                          <p className="font-bold text-emerald-600">₹{c.sales.toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top Suppliers */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 font-bold text-purple-700 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Top Suppliers by Purchases
                  </div>
                  <div className="divide-y divide-slate-100">
                    {partyAnalytics.supplierPurchases.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">No supplier data</div>
                    ) : (
                      partyAnalytics.supplierPurchases.map((s, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{s.name}</p>
                              <p className="text-xs text-slate-500">{s.phone}</p>
                            </div>
                          </div>
                          <p className="font-bold text-purple-600">₹{s.purchases.toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-slate-50 rounded-full mb-6">
          <FileSpreadsheet className="w-16 h-16 text-indigo-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Export for Accountant</h3>
        <p className="text-slate-500 max-w-sm mb-8">Download complete reports for your accountant or CA.</p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <button
            onClick={() => exportCSV('pl')}
            className="py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" /> P&L
          </button>
          <button
            onClick={() => exportCSV('stock')}
            className="py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" /> Stock
          </button>
          <button className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" /> All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
