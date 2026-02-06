
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Package, ShoppingCart, AlertCircle, Plus, Wallet, Trash2, Award, ArrowUpRight } from 'lucide-react';
import { Item, Invoice, Expense, Party } from '../types/admin';

interface DashboardProps {
  items: Item[];
  invoices: Invoice[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  parties?: Party[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, invoices, expenses, setExpenses, parties = [] }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExp, setNewExp] = useState({ category: 'Utilities', amount: 0, note: '' });

  const stats = useMemo(() => {
    const totalSales = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const lowStockItems = items.filter(i => i.stock <= i.minStock).length;
    
    // Calculate top products
    const productSales: Record<string, number> = {};
    invoices.filter(i => i.type === 'sale').forEach(inv => {
      inv.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      sales: totalSales,
      expenses: totalExp,
      inventoryValue: items.reduce((sum, i) => sum + (i.stock * i.purchasePrice), 0),
      lowStock: lowStockItems,
      topProducts
    };
  }, [items, invoices, expenses]);

  const handleAddExpense = () => {
    const expense: Expense = {
      id: Date.now().toString(),
      ...newExp,
      date: new Date().toISOString()
    };
    setExpenses(prev => [...prev, expense]);
    setShowExpenseModal(false);
    setNewExp({ category: 'Utilities', amount: 0, note: '' });
  };

  const chartData = [
    { name: 'Mon', sales: 4200, exp: 1100 },
    { name: 'Tue', sales: 3800, exp: 2400 },
    { name: 'Wed', sales: 5100, exp: 1200 },
    { name: 'Thu', sales: 4900, exp: 800 },
    { name: 'Fri', sales: 6200, exp: 2800 },
    { name: 'Sat', sales: 7100, exp: 500 },
    { name: 'Sun', sales: 5800, exp: 1300 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Hub</h2>
          <p className="text-slate-500 font-medium">Profitability and performance insights</p>
        </div>
        <button onClick={() => setShowExpenseModal(true)} className="flex items-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all">
          <Wallet className="w-5 h-5 mr-2" /> Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Sales', value: `₹${stats.sales.toLocaleString()}`, icon: TrendingUp, color: 'indigo' },
          { label: 'Op. Expenses', value: `₹${stats.expenses.toLocaleString()}`, icon: Wallet, color: 'rose' },
          { label: 'Inv. Assets', value: `₹${stats.inventoryValue.toLocaleString()}`, icon: Package, color: 'amber' },
          { label: 'Low Stock', value: stats.lowStock.toString(), icon: AlertCircle, color: 'rose' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 bg-${card.color}-50 rounded-2xl flex items-center justify-center text-${card.color}-600 mb-6`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">P&L Trends</h3>
          <div className="h-[350px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} fillOpacity={0.1} fill="#4f46e5" />
                <Area type="monotone" dataKey="exp" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.05} fill="#f43f5e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-indigo-600" /> Best Sellers
            </h3>
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <p className="text-slate-400 text-sm italic py-4">No sales data yet</p>
              ) : (
                stats.topProducts.map(([name, qty], i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{name}</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-indigo-600">{qty} Sold</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-lg font-black leading-tight">Customer<br/>Loyalty Pool</h4>
              <Award className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-4xl font-black mb-1">{parties.reduce((sum, p) => sum + (p.loyaltyPoints || 0), 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Total Points Issued</p>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold">Top: {parties.sort((a,b) => b.loyaltyPoints - a.loyaltyPoints)[0]?.name || 'N/A'}</span>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowExpenseModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
             <h3 className="text-2xl font-black text-slate-900 mb-8">Log Business Expense</h3>
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                   <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newExp.category} onChange={(e) => setNewExp({...newExp, category: e.target.value})}>
                     <option>Utilities</option><option>Rent</option><option>Staff Salary</option><option>Travel</option><option>Maintenance</option><option>Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                   <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl text-rose-600" value={newExp.amount} onChange={(e) => setNewExp({...newExp, amount: Number(e.target.value)})} />
                </div>
                <button onClick={handleAddExpense} className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 mt-4">Record Payment</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
