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
    CheckCircle2,
    Home
} from 'lucide-react';
import type { View, Item, Party, Invoice, Expense, PaymentRecord, BusinessProfile, AppNotification } from '../types/admin';
import Dashboard from '../components/Dashboard';
import Inventory from '../components/Inventory';
import Billing from '../components/Billing';
import Parties from '../components/Parties';
import Reports from '../components/Reports';
import GSTCompliance from '../components/GSTCompliance';
import InvoiceHistory from '../components/InvoiceHistory';
import AIAssistant from '../components/AIAssistant';
import SettingsView from '../components/SettingsView';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
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
    }, [items]);

    useEffect(() => {
        localStorage.setItem('vyapar_parties', JSON.stringify(parties));
    }, [parties]);

    useEffect(() => {
        localStorage.setItem('vyapar_invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('vyapar_expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('vyapar_profile', JSON.stringify(profile));
    }, [profile]);

    const menuItems = [
        { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory' as View, label: 'Inventory', icon: Package },
        { id: 'billing' as View, label: 'Billing / POS', icon: Receipt },
        { id: 'parties' as View, label: 'Parties', icon: Users },
        { id: 'reports' as View, label: 'Reports', icon: BarChart3 },
        { id: 'gst' as View, label: 'GST Compliance', icon: ShieldCheck },
        { id: 'invoices' as View, label: 'Invoice History', icon: FileClock },
        { id: 'settings' as View, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between border-b border-white/10">
                        {isSidebarOpen ? (
                            <div>
                                <h1 className="text-2xl font-black">Vyapar</h1>
                                <p className="text-xs text-white/70">Admin Panel</p>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-xl">V</div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-white text-indigo-600 shadow-lg'
                                        : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Back to Store & Logout */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        <a
                            href="/"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="font-bold text-sm">Back to Store</span>}
                        </a>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}>
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {menuItems.find(m => m.id === activeView)?.label}
                                </h2>
                                <p className="text-sm text-slate-500">Manage your business efficiently</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button
                                onClick={() => setNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-6 h-6" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                                )}
                            </button>

                            {/* AI Assistant */}
                            <button
                                onClick={() => setAIChatOpen(true)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                            >
                                <Bot className="w-5 h-5" />
                                <span className="hidden md:inline">AI Assistant</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* View Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeView === 'dashboard' && <Dashboard items={items} invoices={invoices} expenses={expenses} parties={parties} />}
                    {activeView === 'inventory' && <Inventory items={items} setItems={setItems} />}
                    {activeView === 'billing' && <Billing items={items} setItems={setItems} parties={parties} setParties={setParties} invoices={invoices} setInvoices={setInvoices} profile={profile} />}
                    {activeView === 'parties' && <Parties parties={parties} setParties={setParties} invoices={invoices} payments={payments} setPayments={setPayments} />}
                    {activeView === 'reports' && <Reports items={items} invoices={invoices} expenses={expenses} parties={parties} />}
                    {activeView === 'gst' && <GSTCompliance invoices={invoices} profile={profile} />}
                    {activeView === 'invoices' && <InvoiceHistory invoices={invoices} parties={parties} profile={profile} />}
                    {activeView === 'settings' && <SettingsView profile={profile} setProfile={setProfile} />}
                </div>
            </main>

            {/* AI Assistant Modal */}
            <AIAssistant
                isOpen={isAIChatOpen}
                onClose={() => setAIChatOpen(false)}
                items={items}
                parties={parties}
                invoices={invoices}
            />

            {/* Notifications Panel */}
            {isNotificationOpen && (
                <div className="fixed right-6 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-black text-lg">Notifications</h3>
                        <button onClick={() => setNotificationOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {notifications.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No new notifications</p>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-3 rounded-xl border-2 ${notif.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${notif.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                                            }`} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{notif.title}</h4>
                                            <p className="text-sm text-slate-600">{notif.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
