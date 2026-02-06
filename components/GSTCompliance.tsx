import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Download, ExternalLink, FileText, AlertCircle,
  Calendar, Receipt, FileJson, Database, CheckCircle, Clock,
  Building2, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Invoice, Item } from '../types';
import { gstService } from '../services/gstService';

interface GSTComplianceProps {
  invoices: Invoice[];
  items?: Item[];
}

const GSTCompliance: React.FC<GSTComplianceProps> = ({ invoices, items = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'einvoice'>('gstr1');
  const [showExportModal, setShowExportModal] = useState(false);

  // Get GSTR-1 data
  const gstr1Data = useMemo(() =>
    gstService.prepareGstr1(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );

  // Get GSTR-3B data
  const gstr3bData = useMemo(() =>
    gstService.prepareGstr3b(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );

  // Get tax summary
  const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
  const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-31`;
  const taxLiability = useMemo(() =>
    gstService.getTaxLiabilitySummary(startDate, endDate),
    [startDate, endDate]
  );
  const itcSummary = useMemo(() =>
    gstService.getItcSummary(startDate, endDate),
    [startDate, endDate]
  );

  // Basic summary from legacy invoices
  const legacySummary = {
    totalB2B: invoices.filter(inv => inv.type === 'sale').length,
    taxableValue: invoices.reduce((sum, i) => sum + (i.totalAmount - i.taxAmount), 0),
    totalTax: invoices.reduce((sum, i) => sum + i.taxAmount, 0),
    cgst: invoices.reduce((sum, i) => sum + i.taxAmount / 2, 0),
    sgst: invoices.reduce((sum, i) => sum + i.taxAmount / 2, 0),
  };

  // Merge with new service data
  const summary = {
    totalB2B: gstr1Data.b2b.reduce((sum, b) => sum + b.invoices.length, 0) || legacySummary.totalB2B,
    taxableValue: taxLiability.taxableValue || legacySummary.taxableValue,
    totalTax: taxLiability.totalTax || legacySummary.totalTax,
    cgst: taxLiability.cgst || legacySummary.cgst,
    sgst: taxLiability.sgst || legacySummary.sgst,
    igst: taxLiability.igst || 0,
  };

  // Export GSTR-1 JSON
  const exportGstr1Json = () => {
    const blob = new Blob([JSON.stringify(gstr1Data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1-${selectedMonth}-${selectedYear}.json`;
    a.click();
  };

  // Export GSTR-3B JSON
  const exportGstr3bJson = () => {
    const blob = new Blob([JSON.stringify(gstr3bData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR3B-${selectedMonth}-${selectedYear}.json`;
    a.click();
  };

  // Month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">GST & Compliance</h1>
          <p className="text-slate-500">Government reporting, GSTR-1, GSTR-3B filings, E-Invoice.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <a
            href="https://gst.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            GST Portal
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'gstr1', label: 'GSTR-1', icon: FileText },
            { id: 'gstr3b', label: 'GSTR-3B', icon: ShieldCheck },
            { id: 'einvoice', label: 'E-Invoice', icon: Receipt },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-center font-bold transition-colors flex items-center justify-center ${activeTab === tab.id
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
          {/* GSTR-1 Tab */}
          {activeTab === 'gstr1' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">GSTR-1 - Outward Supplies</h3>
                  <p className="text-sm text-slate-500">Details of sales and outward supplies</p>
                </div>
                <button
                  onClick={exportGstr1Json}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">B2B Invoices</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{summary.totalB2B}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Taxable Value</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">₹{summary.taxableValue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">CGST+SGST</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">₹{(summary.cgst + summary.sgst).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">IGST</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">₹{summary.igst.toLocaleString()}</p>
                </div>
              </div>

              {/* B2B Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 font-bold text-slate-700">
                  B2B Invoices by GSTIN
                </div>
                {gstr1Data.b2b.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No B2B invoices for this period</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">GSTIN</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Invoices</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Taxable</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1Data.b2b.map((entry, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-mono text-xs">{entry.ctin}</td>
                          <td className="px-4 py-3">{entry.invoices.length}</td>
                          <td className="px-4 py-3 text-right">
                            ₹{entry.invoices.reduce((s, inv) => s + inv.taxableValue, 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            ₹{entry.invoices.reduce((s, inv) => s + inv.cgst + inv.sgst + inv.igst, 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* HSN Summary */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 font-bold text-slate-700">
                  HSN-wise Summary
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">HSN</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Taxable</th>
                      <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1Data.hsn.length > 0 ? gstr1Data.hsn.map((hsn, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-mono">{hsn.hsnCode}</td>
                        <td className="px-4 py-3">{hsn.description}</td>
                        <td className="px-4 py-3 text-right">{hsn.quantity} {hsn.uqc}</td>
                        <td className="px-4 py-3 text-right">₹{hsn.taxableValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold">₹{hsn.totalTax.toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          No HSN data for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GSTR-3B Tab */}
          {activeTab === 'gstr3b' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">GSTR-3B - Monthly Summary</h3>
                  <p className="text-sm text-slate-500">Summary return with tax payment details</p>
                </div>
                <button
                  onClick={exportGstr3bJson}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
              </div>

              {/* 3.1 Outward Supplies */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-indigo-200 text-sm uppercase mb-4">3.1 - Outward Supplies & Tax Liability</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-indigo-200">CGST</p>
                    <p className="text-xl font-black">₹{gstr3bData.outwardTaxable.centralTax.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-indigo-200">SGST</p>
                    <p className="text-xl font-black">₹{gstr3bData.outwardTaxable.stateTax.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-indigo-200">IGST</p>
                    <p className="text-xl font-black">₹{gstr3bData.outwardTaxable.integratedTax.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-indigo-200">Cess</p>
                    <p className="text-xl font-black">₹{gstr3bData.outwardTaxable.cess.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 4. ITC Available */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h4 className="font-bold text-emerald-800 text-sm uppercase mb-4 flex items-center">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  4. Eligible ITC (Input Tax Credit)
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-600">CGST</p>
                    <p className="text-xl font-black text-emerald-700">₹{gstr3bData.itcAvailable.all.cgst.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-600">SGST</p>
                    <p className="text-xl font-black text-emerald-700">₹{gstr3bData.itcAvailable.all.sgst.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-600">IGST</p>
                    <p className="text-xl font-black text-emerald-700">₹{gstr3bData.itcAvailable.all.igst.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-600">Total ITC</p>
                    <p className="text-xl font-black text-emerald-700">
                      ₹{(gstr3bData.itcAvailable.all.cgst + gstr3bData.itcAvailable.all.sgst + gstr3bData.itcAvailable.all.igst).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Net Tax Payable */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <h4 className="font-bold text-rose-800 text-sm uppercase mb-4 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  6. Tax Payable (Liability - ITC)
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-rose-100">
                    <p className="text-xs text-rose-600">CGST</p>
                    <p className="text-xl font-black text-rose-700">₹{gstr3bData.taxPayable.cgst.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-rose-100">
                    <p className="text-xs text-rose-600">SGST</p>
                    <p className="text-xl font-black text-rose-700">₹{gstr3bData.taxPayable.sgst.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-rose-100">
                    <p className="text-xs text-rose-600">IGST</p>
                    <p className="text-xl font-black text-rose-700">₹{gstr3bData.taxPayable.igst.toLocaleString()}</p>
                  </div>
                  <div className="bg-rose-600 rounded-lg p-3 text-white">
                    <p className="text-xs text-rose-200">Net Payable</p>
                    <p className="text-xl font-black">
                      ₹{(gstr3bData.taxPayable.cgst + gstr3bData.taxPayable.sgst + gstr3bData.taxPayable.igst).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E-Invoice Tab */}
          {activeTab === 'einvoice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">E-Invoice Generation</h3>
                  <p className="text-sm text-slate-500">Generate IRN for B2B invoices above ₹5 Cr turnover</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">E-Invoice Structure Ready</p>
                  <p className="text-sm text-amber-700">
                    The system generates E-Invoice JSON structure compatible with NIC (National Informatics Centre) API.
                    Actual API integration requires GSP (GST Suvidha Provider) credentials.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h4 className="font-bold text-slate-700 mb-4">E-Invoice Workflow</h4>
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: 'Create B2B Invoice', status: 'done' },
                    { step: 2, label: 'Generate E-Invoice JSON', status: 'done' },
                    { step: 3, label: 'Submit to IRP', status: 'pending' },
                    { step: 4, label: 'Get IRN & QR', status: 'pending' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'done'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {item.status === 'done'
                          ? <CheckCircle className="w-5 h-5" />
                          : <Clock className="w-5 h-5" />
                        }
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-2 text-center">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-700 mb-2">Sample E-Invoice Structure</h4>
                <pre className="bg-slate-800 text-emerald-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {`{
  "Version": "1.1",
  "TranDtls": {
    "TaxSch": "GST",
    "SupTyp": "B2B",
    "RegRev": "N"
  },
  "DocDtls": {
    "Typ": "INV",
    "No": "INV-202602-0001",
    "Dt": "07/02/2026"
  },
  "SellerDtls": {
    "Gstin": "29ABCDE1234F1Z5",
    "LglNm": "Your Business Name",
    ...
  },
  "BuyerDtls": {
    "Gstin": "29XYZAB5678C1D2",
    "LglNm": "Customer Name",
    ...
  },
  "ItemList": [...],
  "ValDtls": {
    "AssVal": 10000,
    "CgstVal": 900,
    "SgstVal": 900,
    "TotInvVal": 11800
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Tax Collected</p>
              <p className="text-2xl font-black text-slate-800 mt-1">₹{summary.totalTax.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total ITC</p>
              <p className="text-2xl font-black text-slate-800 mt-1">₹{itcSummary.totalItc.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase">Net Payable</p>
              <p className="text-2xl font-black mt-1">₹{Math.max(0, summary.totalTax - itcSummary.totalItc).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCompliance;
