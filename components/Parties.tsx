import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, History, X, Receipt, ArrowUpRight, ArrowDownLeft,
  Wallet, MessageSquare, Award, AlertTriangle, Settings, CreditCard,
  Clock, ChevronDown, ChevronUp, Edit2, Save
} from 'lucide-react';
import { Party, Invoice, PaymentRecord } from '../types';
import { paymentService } from '../services/paymentService';

interface PartiesProps {
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  invoices: Invoice[];
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
}

const Parties: React.FC<PartiesProps> = ({ parties, setParties, invoices, payments, setPayments }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartyHistory, setSelectedPartyHistory] = useState<Party | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmt, setPaymentAmt] = useState(0);
  const [showCreditSettings, setShowCreditSettings] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<{ creditLimit: number; creditDays: number }>({ creditLimit: 0, creditDays: 30 });

  const [newParty, setNewParty] = useState<Partial<Party>>({
    name: '', phone: '', type: 'customer', balance: 0, gstin: '', loyaltyPoints: 0,
    creditLimit: 0, creditDays: 30
  });

  // Get outstanding alerts
  const overdueParties = useMemo(() => {
    return parties.filter(p => {
      if (p.balance <= 0) return false;
      // Check if any invoice is overdue beyond credit days
      const partyInvoices = invoices.filter(i => i.partyId === p.id && i.type === 'sale');
      const creditDays = (p as any).creditDays || 30;
      return partyInvoices.some(inv => {
        const daysSince = Math.floor((Date.now() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > creditDays && inv.totalAmount > 0;
      });
    });
  }, [parties, invoices]);

  // Parties near credit limit
  const nearCreditLimit = useMemo(() => {
    return parties.filter(p => {
      const creditLimit = (p as any).creditLimit || 0;
      if (creditLimit === 0) return false;
      const utilization = (p.balance / creditLimit) * 100;
      return utilization >= 80;
    });
  }, [parties]);

  const handleAddParty = () => {
    if (!newParty.name || !newParty.phone) return;
    const party: Party = {
      id: Date.now().toString(),
      name: newParty.name,
      phone: newParty.phone,
      type: activeTab,
      balance: Number(newParty.balance) || 0,
      gstin: newParty.gstin || '',
      loyaltyPoints: 0,
      creditLimit: Number(newParty.creditLimit) || 0,
      creditDays: Number(newParty.creditDays) || 30,
    } as Party;
    setParties([...parties, party]);
    setShowAddModal(false);
    setNewParty({ name: '', phone: '', type: 'customer', balance: 0, gstin: '', loyaltyPoints: 0, creditLimit: 0, creditDays: 30 });
  };

  const handleRecordPayment = () => {
    if (!selectedPartyHistory) return;
    const rec: PaymentRecord = {
      id: Date.now().toString(),
      partyId: selectedPartyHistory.id,
      amount: paymentAmt,
      date: new Date().toISOString(),
      mode: 'cash',
      note: 'Ledger Payment'
    };
    setPayments(prev => [...prev, rec]);
    setParties(prev => prev.map(p => p.id === selectedPartyHistory.id ? { ...p, balance: p.balance - paymentAmt } : p));
    setShowPaymentModal(false);
    setPaymentAmt(0);
  };

  const handleSaveCreditSettings = (partyId: string) => {
    setParties(prev => prev.map(p =>
      p.id === partyId
        ? { ...p, creditLimit: editCredits.creditLimit, creditDays: editCredits.creditDays } as Party
        : p
    ));
    setShowCreditSettings(null);
  };

  const sendReminder = (party: Party) => {
    if (party.balance <= 0) return;
    const message = `Dear ${party.name}, you have a pending balance of ₹${party.balance.toLocaleString()} with us. Please settle it at your earliest convenience. Thank you!`;
    const whatsappUrl = `https://wa.me/${party.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getCreditUtilization = (party: Party) => {
    const creditLimit = (party as any).creditLimit || 0;
    if (creditLimit === 0) return 0;
    return Math.min(100, (party.balance / creditLimit) * 100);
  };

  const getCreditColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-rose-500';
    if (utilization >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const filteredParties = parties.filter(p => p.type === activeTab);
  const partyInvoices = selectedPartyHistory ? invoices.filter(i => i.partyId === selectedPartyHistory.id) : [];
  const partyPayments = selectedPartyHistory ? payments.filter(p => p.partyId === selectedPartyHistory.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Parties & Ledger</h1>
          <p className="text-slate-500 font-medium">Customer CRM, credit control, and outstanding tracking</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100">
          <Plus className="w-5 h-5 mr-2" /> New Profile
        </button>
      </div>

      {/* Outstanding Alerts */}
      {(overdueParties.length > 0 || nearCreditLimit.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueParties.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800">{overdueParties.length} Overdue Accounts</p>
                <p className="text-sm text-rose-700">
                  {overdueParties.slice(0, 2).map(p => p.name).join(', ')}
                  {overdueParties.length > 2 && ` +${overdueParties.length - 2} more`}
                </p>
              </div>
            </div>
          )}
          {nearCreditLimit.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">{nearCreditLimit.length} Near Credit Limit</p>
                <p className="text-sm text-amber-700">
                  {nearCreditLimit.slice(0, 2).map(p => p.name).join(', ')}
                  {nearCreditLimit.length > 2 && ` +${nearCreditLimit.length - 2} more`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2 bg-white p-2 rounded-3xl border border-slate-200 w-fit">
        <button onClick={() => setActiveTab('customer')} className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'customer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Customers</button>
        <button onClick={() => setActiveTab('vendor')} className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vendor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Vendors</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map(party => {
          const creditLimit = (party as any).creditLimit || 0;
          const creditDays = (party as any).creditDays || 30;
          const utilization = getCreditUtilization(party);
          const isOverdue = overdueParties.some(p => p.id === party.id);
          const isNearLimit = nearCreditLimit.some(p => p.id === party.id);

          return (
            <div key={party.id} className={`bg-white p-8 rounded-[2.5rem] border ${isOverdue ? 'border-rose-300 bg-rose-50/30' : isNearLimit ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'} hover:shadow-2xl transition-all group`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${isOverdue ? 'bg-rose-100 text-rose-600' : isNearLimit ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'} rounded-2xl flex items-center justify-center font-black text-xl`}>
                    {party.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{party.name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{party.phone}</p>
                    {party.gstin && <p className="text-[10px] text-slate-400 font-mono">{party.gstin}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isOverdue && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  {party.balance > 0 && <button onClick={() => sendReminder(party)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><MessageSquare className="w-4 h-4" /></button>}
                  <button onClick={() => setParties(parties.filter(p => p.id !== party.id))} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="py-6 border-y border-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Due Balance</p>
                    <p className={`text-xl font-black ${party.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{Math.abs(party.balance).toLocaleString()}</p>
                  </div>
                  {activeTab === 'customer' && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center justify-end"><Award className="w-3 h-3 mr-1 text-indigo-600" /> Points</p>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{party.loyaltyPoints || 0}</span>
                    </div>
                  )}
                </div>

                {/* Credit Limit Progress */}
                {creditLimit > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Credit: ₹{creditLimit.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-500">{utilization.toFixed(0)}% used</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCreditColor(utilization)} transition-all`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {creditDays} days credit period
                    </p>
                  </div>
                )}

                {/* Credit Settings Toggle */}
                {showCreditSettings === party.id ? (
                  <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Limit (₹)</label>
                      <input
                        type="number"
                        value={editCredits.creditLimit}
                        onChange={(e) => setEditCredits({ ...editCredits, creditLimit: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Days</label>
                      <input
                        type="number"
                        value={editCredits.creditDays}
                        onChange={(e) => setEditCredits({ ...editCredits, creditDays: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveCreditSettings(party.id)}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center"
                      >
                        <Save className="w-3 h-3 mr-1" /> Save
                      </button>
                      <button
                        onClick={() => setShowCreditSettings(null)}
                        className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditCredits({ creditLimit, creditDays });
                      setShowCreditSettings(party.id);
                    }}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center justify-center"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Credit Settings
                  </button>
                )}
              </div>

              <button onClick={() => setSelectedPartyHistory(party)} className="w-full mt-6 py-3 bg-slate-50 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all flex items-center justify-center uppercase tracking-widest">
                Full Statement <History className="w-4 h-4 ml-2" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedPartyHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPartyHistory(null)}></div>
          <div className="w-full max-w-xl h-full bg-white shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedPartyHistory.name}</h3>
                <p className="text-xs font-bold text-slate-400">Transaction Chronology</p>
              </div>
              <button onClick={() => setSelectedPartyHistory(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Ledger</p>
                  <p className={`text-2xl font-black ${selectedPartyHistory.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{selectedPartyHistory.balance.toLocaleString()}</p>
                </div>
                <button onClick={() => setShowPaymentModal(true)} className="p-6 bg-indigo-600 text-white rounded-3xl flex flex-col items-center justify-center group"><Wallet className="w-5 h-5 mb-1" /><span className="text-[10px] font-black uppercase">Post Payment</span></button>
              </div>

              {/* Credit Info */}
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Credit Limit</p>
                  <p className="text-lg font-black text-indigo-700">₹{((selectedPartyHistory as any).creditLimit || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Credit Period</p>
                  <p className="text-lg font-black text-indigo-700">{(selectedPartyHistory as any).creditDays || 30} days</p>
                </div>
              </div>

              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">Recent Activity</h4>
              {[...partyInvoices, ...partyPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${(tx as any).amount ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{(tx as any).amount ? <Wallet className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}</div>
                    <div><p className="font-black text-slate-900 text-xs leading-none">{(tx as any).amount ? 'Payment' : tx.id}</p><p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{new Date(tx.date).toLocaleDateString()}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">₹{((tx as any).amount || tx.totalAmount).toLocaleString()}</p>
                    <span className={`text-[8px] font-black uppercase ${(tx as any).amount ? 'text-emerald-500' : 'text-slate-400'}`}>{(tx as any).amount ? 'CR' : 'DR'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowPaymentModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Record Payment</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Received/Paid Amount (₹)</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-emerald-600" value={paymentAmt} onChange={(e) => setPaymentAmt(Number(e.target.value))} />
              </div>
              <button onClick={handleRecordPayment} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">Authorize Ledger Update</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-8">New {activeTab} Enrollment</h3>
            <div className="space-y-6">
              <input type="text" placeholder="Legal Name" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newParty.name} onChange={(e) => setNewParty({ ...newParty, name: e.target.value })} />
              <input type="text" placeholder="Contact Number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newParty.phone} onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })} />
              <input type="text" placeholder="GSTIN (optional)" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newParty.gstin} onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Credit Limit (₹)</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newParty.creditLimit} onChange={(e) => setNewParty({ ...newParty, creditLimit: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Credit Days</label>
                  <input type="number" placeholder="30" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newParty.creditDays} onChange={(e) => setNewParty({ ...newParty, creditDays: Number(e.target.value) })} />
                </div>
              </div>

              <button onClick={handleAddParty} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs">Create Party Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
