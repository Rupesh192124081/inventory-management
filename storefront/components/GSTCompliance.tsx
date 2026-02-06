
import React from 'react';
import { ShieldCheck, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Invoice } from '../types/admin';

interface GSTComplianceProps {
  invoices: Invoice[];
}

const GSTCompliance: React.FC<GSTComplianceProps> = ({ invoices }) => {
  const gstrSummary = {
    totalB2B: invoices.filter(inv => inv.type === 'sale').length,
    taxableValue: invoices.reduce((sum, i) => sum + (i.totalAmount - i.taxAmount), 0),
    totalTax: invoices.reduce((sum, i) => sum + i.taxAmount, 0),
    cgst: invoices.reduce((sum, i) => sum + i.taxAmount / 2, 0),
    sgst: invoices.reduce((sum, i) => sum + i.taxAmount / 2, 0),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">GST & Compliance</h1>
          <p className="text-slate-500">Government reporting, GSTR-1, GSTR-3B filings.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <ExternalLink className="w-4 h-4 mr-2" />
            Government Portal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">GSTR-1</h3>
          <p className="text-xs text-slate-500 mb-6">Details of outward supplies (Sales)</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">B2B Invoices</span>
              <span className="font-bold">{gstrSummary.totalB2B}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Taxable Value</span>
              <span className="font-bold">₹{gstrSummary.taxableValue.toLocaleString()}</span>
            </div>
            <button className="w-full mt-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
              Prepare Report
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">GSTR-3B</h3>
          <p className="text-xs text-slate-500 mb-6">Monthly summary return and tax payment</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Input Tax Credit</span>
              <span className="font-bold text-emerald-600">₹4,200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax Liability</span>
              <span className="font-bold text-rose-600">₹{gstrSummary.totalTax.toLocaleString()}</span>
            </div>
            <button className="w-full mt-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
              Check ITC Eligibility
            </button>
          </div>
        </div>

        <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertCircle className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold mb-2">Tax Wallet</h3>
          <p className="text-xs text-indigo-300 mb-6">Total calculated tax for current month</p>
          <div className="space-y-3">
             <div>
               <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Total CGST + SGST</p>
               <p className="text-3xl font-black">₹{gstrSummary.totalTax.toLocaleString()}</p>
             </div>
             <div className="flex space-x-4 pt-2">
                <div className="flex-1 p-2 bg-white/10 rounded-lg">
                  <p className="text-[10px] text-indigo-200 font-bold uppercase">CGST</p>
                  <p className="text-sm font-bold">₹{gstrSummary.cgst.toLocaleString()}</p>
                </div>
                <div className="flex-1 p-2 bg-white/10 rounded-lg">
                  <p className="text-[10px] text-indigo-200 font-bold uppercase">SGST</p>
                  <p className="text-sm font-bold">₹{gstrSummary.sgst.toLocaleString()}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">HSN-wise Summary</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">HSN Code</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Description</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Qty</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Taxable Value</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Tax Rate</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Tax Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-mono text-sm">0902</td>
              <td className="px-6 py-4 text-sm">Tea and related products</td>
              <td className="px-6 py-4 text-sm font-bold">45 kg</td>
              <td className="px-6 py-4 text-sm">₹15,750</td>
              <td className="px-6 py-4 text-sm">5%</td>
              <td className="px-6 py-4 text-sm font-bold text-right">₹787.50</td>
            </tr>
            <tr className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-mono text-sm">1701</td>
              <td className="px-6 py-4 text-sm">Refined Sugar</td>
              <td className="px-6 py-4 text-sm font-bold">120 kg</td>
              <td className="px-6 py-4 text-sm">₹6,600</td>
              <td className="px-6 py-4 text-sm">5%</td>
              <td className="px-6 py-4 text-sm font-bold text-right">₹330.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GSTCompliance;
