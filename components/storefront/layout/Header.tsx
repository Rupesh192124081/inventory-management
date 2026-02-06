import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';

const Header: React.FC = () => {
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const updateCartCount = () => {
            try {
                const cart = JSON.parse(localStorage.getItem('storefront_cart') || '[]');
                const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
                setCartCount(count);
            } catch {
                setCartCount(0);
            }
        };

        updateCartCount();
        window.addEventListener('cart-updated', updateCartCount);
        window.addEventListener('storage', updateCartCount);

        return () => {
            window.removeEventListener('cart-updated', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-black text-xl">V</span>
                        </div>
                        <div>
                            <h1 className="font-black text-lg">Vyapar <span className="text-indigo-600">Store</span></h1>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Premium Shopping</p>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="/" className="font-bold text-slate-600 hover:text-indigo-600 transition-colors">Home</a>
                        <a href="/products" className="font-bold text-slate-600 hover:text-indigo-600 transition-colors">Products</a>
                        <a href="/admin" className="font-bold text-slate-600 hover:text-indigo-600 transition-colors">Admin</a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <a href="/cart" className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <ShoppingCart className="w-6 h-6 text-slate-600" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </a>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-slate-100">
                        <a href="/" className="block py-3 font-bold text-slate-600">Home</a>
                        <a href="/products" className="block py-3 font-bold text-slate-600">Products</a>
                        <a href="/cart" className="block py-3 font-bold text-slate-600">Cart ({cartCount})</a>
                        <a href="/admin" className="block py-3 font-bold text-indigo-600">Admin Dashboard</a>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
