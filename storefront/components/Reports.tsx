
import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { Item, Invoice, Party, Expense } from '../types/admin';

interface ReportsProps {
  items: Item[];
  invoices: Invoice[];
  parties: Party[];
  // Added expenses property to match prop passing in App.tsx
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ items, invoices, parties, expenses }) => {
  const totals = {
    sales: invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0),
    purchases: invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.totalAmount, 0),
    returns: invoices.filter(i => i.type === 'return').reduce((sum, i) => sum + i.totalAmount, 0),
  };

  // Calculate actual total from business expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Net Profit: Sales - Purchases - Expenses
  const netProfit = totals.sales - totals.purchases - totalExpenses;

  const reportTypes = [
    { name: 'Profit & Loss', icon: TrendingUp, color: 'emerald', desc: 'Summary of income and expenses' },
    { name: 'Stock Report', icon: BarChart3, color: 'blue', desc: 'Detailed stock-in/out valuation' },
    { name: 'Receivables', icon: FileSpreadsheet, color: 'amber', desc: 'Pending payments from customers' },
    { name: 'Day Book', icon: FileText, color: 'indigo', desc: 'Daily transaction summary' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Business Reports</h1>
        <p className="text-slate-500">Export financial data for your business analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, i) => (
          <button 
            key={i} 
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left"
          >
            <div className={`w-12 h-12 bg-${report.color}-50 rounded-xl flex items-center justify-center text-${report.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">{report.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{report.desc}</p>
            <div className="mt-6 flex items-center text-xs font-bold text-indigo-600">
              Download PDF <Download className="w-3 h-3 ml-2" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-8">P&L Quick View</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span className="text-slate-600">Total Sales (A)</span>
              </div>
              <span className="font-bold text-slate-800">₹{totals.sales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>
                <span className="text-slate-600">Total Purchases (B)</span>
              </div>
              <span className="font-bold text-slate-800">₹{totals.purchases.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-slate-600">Operating Expenses</span>
              </div>
              {/* Replaced hardcoded 12,400 with actual calculated totalExpenses */}
              <span className="font-bold text-slate-800">₹{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800 uppercase tracking-wider">Net Profit</span>
              <div className="text-right">
                <p className={`text-2xl font-black ${netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{netProfit.toLocaleString()}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-1">Tax Estimated: ₹{(Math.max(0, netProfit) * 0.18).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="p-6 bg-slate-50 rounded-full mb-6">
              <FileSpreadsheet className="w-16 h-16 text-indigo-200" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Export for Accountant</h3>
           <p className="text-slate-500 max-w-sm mb-8">Download a complete Excel package containing all ledger entries, invoices, and tax summaries for easy filing.</p>
           <div className="grid grid-cols-2 gap-4 w-full">
              <button className="py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" /> .XLSX
              </button>
              <button className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" /> .CSV
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
