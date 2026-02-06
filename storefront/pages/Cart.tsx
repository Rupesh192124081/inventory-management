import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const Cart: React.FC = () => {
    const { cart, updateQuantity, removeItem, total, itemCount } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-slate-400" />
                    </div>
                    <h2 className="text-4xl font-black mb-4">Your Cart is Empty</h2>
                    <p className="text-slate-500 text-lg mb-8">Add some products to get started!</p>
                    <a href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                        Browse Products <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        );
    }

    const subtotal = total;
    const tax = total * 0.18;
    const shipping = total > 500 ? 0 : 50;
    const grandTotal = subtotal + tax + shipping;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => {
                            if (!item) return null;
                            return (
                                <div key={`${item.itemId}-${item.variantId}`} className="bg-white rounded-3xl p-6 flex gap-6">
                                    {/* Image */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl shrink-0 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-2xl font-black text-slate-400">{item.name[0]}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-slate-500 text-sm mb-3">₹{item.price.toLocaleString()} each</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, item.variantId, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, item.variantId, item.quantity + 1)}
                                                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.itemId, item.variantId)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-indigo-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 sticky top-24">
                            <h2 className="text-2xl font-black mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Subtotal ({itemCount} items)</span>
                                    <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tax (18%)</span>
                                    <span className="font-bold">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Shipping</span>
                                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
                                        Add ₹{(500 - subtotal).toLocaleString()} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black">Total</span>
                                    <span className="text-3xl font-black text-indigo-600">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <a href="/checkout" className="block w-full px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-center hover:bg-indigo-700 transition-colors mb-4">
                                Proceed to Checkout
                            </a>

                            <a href="/products" className="block w-full px-8 py-4 border-2 border-slate-200 rounded-2xl font-bold text-center hover:bg-slate-50 transition-colors">
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
