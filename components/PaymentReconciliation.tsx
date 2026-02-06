import React, { useState, useMemo } from 'react';
import {
    Search, Download, DollarSign, ArrowUpCircle, ArrowDownCircle,
    User, Calendar, AlertTriangle, CheckCircle, Clock, ChevronDown,
    CreditCard, Banknote, Smartphone, Receipt
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { Party } from '../types';
import { PaymentMode } from '../types/billing';

interface PaymentReconciliationProps {
    parties: Party[];
    onRecordPayment?: (type: 'in' | 'out') => void;
}

const PaymentReconciliation: React.FC<PaymentReconciliationProps> = ({ parties, onRecordPayment }) => {
    const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedParty, setExpandedParty] = useState<string | null>(null);

    // Get data
    const receivables = useMemo(() => paymentService.getOutstandingReceivables(), []);
    const payables = useMemo(() => paymentService.getOutstandingPayables(), []);
    const paymentsIn = useMemo(() => paymentService.getPaymentsIn().slice(0, 20), []);
    const paymentsOut = useMemo(() => paymentService.getPaymentsOut().slice(0, 20), []);

    // Summary
    const totalReceivables = useMemo(() => paymentService.getTotalReceivables(), []);
    const totalPayables = useMemo(() => paymentService.getTotalPayables(), []);

    // Filter by search
    const filteredData = useMemo(() => {
        const data = activeTab === 'receivables' ? receivables : payables;
        if (!searchQuery) return data;

        const query = searchQuery.toLowerCase();
        return data.filter(d =>
            d.partyName.toLowerCase().includes(query) ||
            d.partyPhone?.includes(query)
        );
    }, [activeTab, receivables, payables, searchQuery]);

    // Payment mode icon
    const getPaymentIcon = (mode: PaymentMode) => {
        switch (mode) {
            case 'cash': return <Banknote className="w-4 h-4" />;
            case 'card': return <CreditCard className="w-4 h-4" />;
            case 'upi': return <Smartphone className="w-4 h-4" />;
            case 'cheque': return <Receipt className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    // Format date
    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Get aging badge
    const getAgingBadge = (days: number) => {
        if (days <= 30) return { color: 'bg-emerald-100 text-emerald-700', text: 'Current' };
        if (days <= 60) return { color: 'bg-amber-100 text-amber-700', text: '31-60 Days' };
        if (days <= 90) return { color: 'bg-orange-100 text-orange-700', text: '61-90 Days' };
        return { color: 'bg-rose-100 text-rose-700', text: '90+ Days' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Payment Reconciliation</h1>
                    <p className="text-slate-500">Track receivables, payables, and payment history</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onRecordPayment?.('in')}
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                        <ArrowDownCircle className="w-4 h-4 mr-2" />
                        Record Payment In
                    </button>
                    <button
                        onClick={() => onRecordPayment?.('out')}
                        className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                    >
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                        Record Payment Out
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-200 uppercase">Total Receivables</p>
                            <p className="text-3xl font-black mt-1">₹{totalReceivables.toLocaleString()}</p>
                            <p className="text-xs text-emerald-200 mt-1">{receivables.length} customers</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-200 uppercase">Total Payables</p>
                            <p className="text-3xl font-black mt-1">₹{totalPayables.toLocaleString()}</p>
                            <p className="text-xs text-rose-200 mt-1">{payables.length} suppliers</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-200 uppercase">Overdue (90+ Days)</p>
                            <p className="text-3xl font-black mt-1">
                                ₹{receivables.reduce((sum, r) => sum + r.overdue90Plus, 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-amber-200 mt-1">Needs attention</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-indigo-200 uppercase">Net Position</p>
                            <p className="text-3xl font-black mt-1">
                                ₹{(totalReceivables - totalPayables).toLocaleString()}
                            </p>
                            <p className="text-xs text-indigo-200 mt-1">
                                {totalReceivables > totalPayables ? 'Net receivable' : 'Net payable'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('receivables')}
                            className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'receivables'
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ArrowDownCircle className="w-4 h-4 inline mr-2" />
                            Receivables
                        </button>
                        <button
                            onClick={() => setActiveTab('payables')}
                            className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'payables'
                                    ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ArrowUpCircle className="w-4 h-4 inline mr-2" />
                            Payables
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab === 'receivables' ? 'customers' : 'suppliers'}...`}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                        <div className="py-12 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                            <p className="font-medium text-slate-600">All Clear!</p>
                            <p className="text-sm text-slate-500">
                                No outstanding {activeTab === 'receivables' ? 'receivables' : 'payables'}
                            </p>
                        </div>
                    ) : (
                        filteredData.map(entry => (
                            <div key={entry.partyId}>
                                <button
                                    onClick={() => setExpandedParty(expandedParty === entry.partyId ? null : entry.partyId)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'receivables' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">{entry.partyName}</p>
                                            <p className="text-sm text-slate-500">{entry.partyPhone || 'No phone'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${activeTab === 'receivables' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                ₹{entry.totalOutstanding.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">{entry.invoices.length} invoices</p>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedParty === entry.partyId ? 'rotate-180' : ''
                                            }`} />
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {expandedParty === entry.partyId && (
                                    <div className="bg-slate-50 px-4 py-3">
                                        {/* Aging Summary */}
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-emerald-600 font-bold">Current</p>
                                                <p className="font-bold text-emerald-700">₹{entry.currentDue.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-amber-600 font-bold">31-60</p>
                                                <p className="font-bold text-amber-700">₹{entry.overdue30.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-orange-600 font-bold">61-90</p>
                                                <p className="font-bold text-orange-700">₹{entry.overdue60.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-rose-50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-rose-600 font-bold">90+</p>
                                                <p className="font-bold text-rose-700">₹{entry.overdue90Plus.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Invoice List */}
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-100">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">Invoice</th>
                                                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">Date</th>
                                                        <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Total</th>
                                                        <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Paid</th>
                                                        <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Balance</th>
                                                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-500">Age</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.invoices.map(inv => {
                                                        const aging = getAgingBadge(inv.ageInDays);
                                                        return (
                                                            <tr key={inv.invoiceId} className="border-t border-slate-100">
                                                                <td className="px-3 py-2 font-medium">{inv.invoiceNo}</td>
                                                                <td className="px-3 py-2 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                                                                <td className="px-3 py-2 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                                                                <td className="px-3 py-2 text-right text-emerald-600">₹{inv.paidAmount.toLocaleString()}</td>
                                                                <td className="px-3 py-2 text-right font-bold">₹{inv.balanceAmount.toLocaleString()}</td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${aging.color}`}>
                                                                        {aging.text}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments In */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Payments Received</h3>
                        <span className="text-xs text-slate-500">{paymentsIn.length} payments</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-auto">
                        {paymentsIn.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No payments recorded yet</p>
                            </div>
                        ) : (
                            paymentsIn.map(payment => (
                                <div key={payment.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                            {getPaymentIcon(payment.mode)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{payment.partyName}</p>
                                            <p className="text-xs text-slate-500">{formatDate(payment.date)}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-emerald-600">+₹{payment.amount.toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Payments Out */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Payments Made</h3>
                        <span className="text-xs text-slate-500">{paymentsOut.length} payments</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-auto">
                        {paymentsOut.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No payments recorded yet</p>
                            </div>
                        ) : (
                            paymentsOut.map(payment => (
                                <div key={payment.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                                            {getPaymentIcon(payment.mode)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{payment.partyName}</p>
                                            <p className="text-xs text-slate-500">{formatDate(payment.date)}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-rose-600">-₹{payment.amount.toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReconciliation;
