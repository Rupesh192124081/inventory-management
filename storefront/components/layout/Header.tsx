import React from 'react';
import { ShoppingCart, User, Search, Heart, Menu, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { itemCount } = useCart();
    const [searchOpen, setSearchOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <button onClick={onMenuClick} className="lg:hidden p-2">
                            <Menu className="w-6 h-6" />
                        </button>
                        <a href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-black text-2xl">V</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-black text-xl">Vyapar <span className="text-indigo-600">Store</span></h1>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premium Products</p>
                            </div>
                        </a>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="md:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                            <Heart className="w-5 h-5" />
                        </button>

                        <a href="/cart" className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                            <ShoppingCart className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </a>

                        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                            <User className="w-5 h-5" />
                            <span className="font-bold text-sm">Account</span>
                        </button>
                        <a href="/admin/login" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all">
                            <User className="w-5 h-5" />
                            <span className="hidden md:inline">Access Inventory</span>
                        </a>
                    </div>
                </div>

                {/* Mobile Search */}
                {searchOpen && (
                    <div className="md:hidden pb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="border-t border-slate-100 hidden lg:block">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-8 h-14">
                        <a href="/" className="font-bold text-sm hover:text-indigo-600 transition-colors">Home</a>
                        <a href="/products" className="font-bold text-sm hover:text-indigo-600 transition-colors">All Products</a>
                        <a href="/products?category=electronics" className="font-bold text-sm hover:text-indigo-600 transition-colors">Electronics</a>
                        <a href="/products?category=fashion" className="font-bold text-sm hover:text-indigo-600 transition-colors">Fashion</a>
                        <a href="/products?featured=true" className="font-bold text-sm text-indigo-600">Featured</a>
                        <a href="/products?sale=true" className="font-bold text-sm text-rose-600">Sale</a>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
