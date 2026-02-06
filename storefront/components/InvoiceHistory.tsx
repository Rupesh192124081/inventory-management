
import React, { useState } from 'react';
import { Search, Eye, Filter, Calendar, FileText, Download } from 'lucide-react';
import { Invoice, Party } from '../types/admin';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  parties: Party[];
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices, parties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');

  const filteredInvoices = invoices.filter(inv => {
    const party = parties.find(p => p.id === inv.partyId);
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (party?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Invoice Archive</h1>
          <p className="text-slate-500 font-medium">History of all trade documents</p>
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200">
          {['all', 'sale', 'purchase'].map(f => (
            <button 
              key={f} 
              onClick={() => setTypeFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${typeFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center">
        <Search className="w-5 h-5 text-slate-400 ml-4" />
        <input 
          type="text" 
          placeholder="Search by ID or customer name..."
          className="w-full px-4 py-3 bg-transparent outline-none font-bold text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Party</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredInvoices.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No records found</td></tr>
            ) : (
              filteredInvoices.map((inv) => {
                const party = parties.find(p => p.id === inv.partyId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-900">{inv.id}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-700">{party?.name || 'Walk-in'}</p>
                      <p className="text-[10px] text-slate-400">{party?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${inv.type === 'sale' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="font-black text-slate-900">₹{inv.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400">{inv.paymentMode}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;
