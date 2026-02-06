
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  BarChart3, 
  ShieldCheck,
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileClock,
  Download,
  Upload,
  Bot,
  Settings,
  X,
  CheckCircle2
} from 'lucide-react';
import { View, Item, Party, Invoice, Expense, PaymentRecord, BusinessProfile, AppNotification } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Parties from './components/Parties';
import Reports from './components/Reports';
import GSTCompliance from './components/GSTCompliance';
import InvoiceHistory from './components/InvoiceHistory';
import AIAssistant from './components/AIAssistant';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAIChatOpen, setAIChatOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  // Core State
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: 'Vyapar Pro Retail',
    tagline: 'Premium Business Suite',
    address: '123 Business Hub, Silicon Valley, India',
    phone: '+91 98765 43210',
    gstin: '27AAAAA0000A1Z5',
    currency: '₹'
  });

  const lowStockItems = useMemo(() => items.filter(i => i.stock <= i.minStock), [items]);
  
  const notifications: AppNotification[] = useMemo(() => {
    const list: AppNotification[] = [];
    if (lowStockItems.length > 0) {
      list.push({
        id: 'low-stock',
        title: 'Inventory Alert',
        message: `${lowStockItems.length} items are running low on stock.`,
        type: 'warning',
        date: new Date().toISOString(),
        read: false
      });
    }
    const recentOverdue = parties.filter(p => p.balance > 5000).slice(0, 2);
    recentOverdue.forEach(p => {
      list.push({
        id: `overdue-${p.id}`,
        title: 'High Receivable',
        message: `${p.name} has a balance of ${profile.currency}${p.balance.toLocaleString()}.`,
        type: 'info',
        date: new Date().toISOString(),
        read: false
      });
    });
    return list;
  }, [lowStockItems, parties, profile.currency]);

  useEffect(() => {
    const savedItems = localStorage.getItem('vyapar_items');
    const savedParties = localStorage.getItem('vyapar_parties');
    const savedInvoices = localStorage.getItem('vyapar_invoices');
    const savedExpenses = localStorage.getItem('vyapar_expenses');
    const savedProfile = localStorage.getItem('vyapar_profile');

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedParties) setParties(JSON.parse(savedParties));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('vyapar_items', JSON.stringify(items));
    localStorage.setItem('vyapar_parties', JSON.stringify(parties));
    localStorage.setItem('vyapar_invoices', JSON.stringify(invoices));
    localStorage.setItem('vyapar_expenses', JSON.stringify(expenses));
    localStorage.setItem('vyapar_profile', JSON.stringify(profile));
  }, [items, parties, invoices, expenses, profile]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'billing', label: 'Billing/POS', icon: Receipt },
    { id: 'invoices', label: 'History', icon: FileClock },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'gst', label: 'Compliance', icon: ShieldCheck },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleExportData = () => {
    const data = { items, parties, invoices, expenses, payments, profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vyapar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="h-20 flex items-center px-6 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl">V</span></div>
        {(isSidebarOpen || isMobileMenuOpen) && (
          <div className="ml-3 overflow-hidden">
            <h1 className="font-black text-lg truncate">{profile.name.split(' ')[0]} <span className="text-indigo-600">Pro</span></h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{profile.tagline}</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveView(item.id as View); setMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-xl font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>
            <item.icon className={`w-5 h-5 shrink-0 ${isSidebarOpen || isMobileMenuOpen ? 'mr-3' : 'mx-auto'}`} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-colors">
          <LogOut className={`w-5 h-5 shrink-0 ${isSidebarOpen || isMobileMenuOpen ? 'mr-3' : 'mx-auto'}`} />
          {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      
      {/* Desktop Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 hidden lg:block ${isSidebarOpen ? 'w-[280px]' : 'w-[88px]'}`}>
        <SidebarContent />
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all z-50">
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 bg-white z-50 transition-transform duration-300 lg:hidden w-[280px] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className={`flex-1 flex flex-col min-h-screen transition-all ${isSidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[88px]'}`}>
        <header className="h-20 glass-header border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600"><Menu className="w-5 h-5" /></button>
            <h2 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hidden sm:block">{activeView} Mode</h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button onClick={handleExportData} title="Backup Data" className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hidden xs:flex"><Download className="w-5 h-5" /></button>
             <button onClick={() => setNotificationOpen(!isNotificationOpen)} className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 relative">
               <Bell className="w-5 h-5" />
               {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
             </button>
             <button onClick={() => setAIChatOpen(true)} className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
               <Bot className="w-4 h-4 mr-2" /> <span className="hidden xs:inline">AI Expert</span>
             </button>
          </div>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="absolute top-20 right-8 w-80 bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 z-50 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-slate-900">Notifications</h4>
                  <button onClick={() => setNotificationOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
               </div>
               <div className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">All clear! No alerts.</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={`p-4 rounded-2xl border ${n.type === 'warning' ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                        <p className={`text-[10px] font-black uppercase mb-1 ${n.type === 'warning' ? 'text-rose-600' : 'text-indigo-600'}`}>{n.title}</p>
                        <p className="text-xs font-bold text-slate-700">{n.message}</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {activeView === 'dashboard' && <Dashboard items={items} invoices={invoices} expenses={expenses} setExpenses={setExpenses} />}
          {activeView === 'inventory' && <Inventory items={items} setItems={setItems} />}
          {activeView === 'billing' && <Billing items={items} setItems={setItems} parties={parties} setParties={setParties} invoices={invoices} setInvoices={setInvoices} profile={profile} />}
          {activeView === 'invoices' && <InvoiceHistory invoices={invoices} parties={parties} />}
          {activeView === 'parties' && <Parties parties={parties} setParties={setParties} invoices={invoices} setPayments={setPayments} payments={payments} />}
          {activeView === 'gst' && <GSTCompliance invoices={invoices} />}
          {activeView === 'reports' && <Reports items={items} invoices={invoices} parties={parties} expenses={expenses} />}
          {activeView === 'settings' && <SettingsView profile={profile} setProfile={setProfile} />}
        </main>
      </div>

      <AIAssistant isOpen={isAIChatOpen} onClose={() => setAIChatOpen(false)} data={{ items, parties, invoices, expenses, profile }} />
    </div>
  );
};

export default App;
