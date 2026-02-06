import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    stock: number;
}

const Cart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const loadCart = () => {
            try {
                const cart = JSON.parse(localStorage.getItem('storefront_cart') || '[]');
                setCartItems(cart);
            } catch {
                setCartItems([]);
            }
        };

        loadCart();
        window.addEventListener('storage', loadCart);
        return () => window.removeEventListener('storage', loadCart);
    }, []);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(id);
            return;
        }

        const item = cartItems.find(i => i.id === id);
        if (item && newQuantity > item.stock) {
            alert('Cannot exceed available stock');
            return;
        }

        const updated = cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updated);
        localStorage.setItem('storefront_cart', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cart-updated'));
    };

    const removeItem = (id: string) => {
        const updated = cartItems.filter(item => item.id !== id);
        setCartItems(updated);
        localStorage.setItem('storefront_cart', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cart-updated'));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('storefront_cart', '[]');
        window.dispatchEvent(new CustomEvent('cart-updated'));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="w-24 h-24 text-slate-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8">Add some products to get started</p>
                    <a href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                        Continue Shopping <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-black mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <div className="flex gap-6">
                                    {/* Image */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300">
                                                {item.name[0]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                                        <p className="text-xl font-black text-indigo-600">₹{item.price.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.stock} in stock</p>
                                    </div>

                                    {/* Quantity & Actions */}
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center bg-slate-100 rounded-xl">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-l-xl transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-r-xl transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-sm text-rose-600 font-bold hover:underline"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="text-xl font-black mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-indigo-600">Add ₹{500 - subtotal} more for free shipping!</p>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4 mb-6">
                                <div className="flex justify-between text-lg">
                                    <span className="font-black">Total</span>
                                    <span className="font-black text-indigo-600">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <a
                                href="/checkout"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                            >
                                Proceed to Checkout <ArrowRight className="w-5 h-5" />
                            </a>

                            <a href="/products" className="block text-center text-sm text-slate-500 mt-4 hover:text-indigo-600">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
