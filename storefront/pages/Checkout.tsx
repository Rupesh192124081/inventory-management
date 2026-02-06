import React, { useState } from 'react';
import { Check, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { inventoryService } from '../services/inventoryService';
import { Order, Address } from '../types/storefront';

const Checkout: React.FC = () => {
    const { rawCart, total, clearCart } = useCart();
    const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');

    const handlePlaceOrder = () => {
        const newOrderId = `ORD${Date.now()}`;
        const products = inventoryService.getProducts();

        const order: Order = {
            id: newOrderId,
            customerId: 'guest',
            customerName: shippingInfo.name,
            customerEmail: shippingInfo.email,
            customerPhone: shippingInfo.phone,
            items: rawCart.map(item => {
                const product = products.find(p => p.id === item.itemId);
                const variant = item.variantId ? product?.variants?.find(v => v.id === item.variantId) : null;
                return {
                    itemId: item.itemId,
                    variantId: item.variantId,
                    name: product?.name || '',
                    price: variant?.salePrice || product?.salePrice || 0,
                    quantity: item.quantity,
                    imageUrl: product?.imageUrl,
                };
            }),
            shippingAddress: {
                id: 'addr1',
                type: 'home',
                street: shippingInfo.street,
                city: shippingInfo.city,
                state: shippingInfo.state,
                pincode: shippingInfo.pincode,
                isDefault: true,
            },
            billingAddress: {
                id: 'addr1',
                type: 'home',
                street: shippingInfo.street,
                city: shippingInfo.city,
                state: shippingInfo.state,
                pincode: shippingInfo.pincode,
                isDefault: true,
            },
            subtotal: total,
            tax: total * 0.18,
            shipping: total > 500 ? 0 : 50,
            discount: 0,
            total: total * 1.18 + (total > 500 ? 0 : 50),
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            orderStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        inventoryService.saveOrder(order);

        // Update stock
        rawCart.forEach(item => {
            inventoryService.updateStock(item.itemId, item.variantId, item.quantity);
        });

        clearCart();
        setOrderId(newOrderId);
        setOrderPlaced(true);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-slate-50 py-20">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-5xl font-black mb-4">Order Placed Successfully!</h1>
                    <p className="text-xl text-slate-600 mb-2">Thank you for your purchase</p>
                    <p className="text-lg text-slate-500 mb-8">Order ID: <span className="font-bold text-indigo-600">{orderId}</span></p>

                    <div className="bg-white rounded-3xl p-8 mb-8 text-left">
                        <h3 className="font-black text-xl mb-4">Order Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Payment Method:</span>
                                <span className="font-bold uppercase">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Delivery Address:</span>
                                <span className="font-bold text-right">{shippingInfo.street}, {shippingInfo.city}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Total Amount:</span>
                                <span className="font-bold text-indigo-600">₹{(total * 1.18 + (total > 500 ? 0 : 50)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <a href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                            Continue Shopping
                        </a>
                        <a href="/orders" className="px-8 py-4 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                            View Orders
                        </a>
                    </div>
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
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-indigo-600' : step === 'payment' || step === 'review' ? 'text-green-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'shipping' ? 'bg-indigo-600 text-white' : step === 'payment' || step === 'review' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                                {step === 'payment' || step === 'review' ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="font-bold hidden sm:inline">Shipping</span>
                        </div>
                        <div className="w-16 h-1 bg-slate-200" />
                        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-indigo-600' : step === 'review' ? 'text-green-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'payment' ? 'bg-indigo-600 text-white' : step === 'review' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                                {step === 'review' ? <Check className="w-5 h-5" /> : '2'}
                            </div>
                            <span className="font-bold hidden sm:inline">Payment</span>
                        </div>
                        <div className="w-16 h-1 bg-slate-200" />
                        <div className={`flex items-center gap-2 ${step === 'review' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'review' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
                                3
                            </div>
                            <span className="font-bold hidden sm:inline">Review</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Form */}
                {step === 'shipping' && (
                    <div className="bg-white rounded-3xl p-8">
                        <h2 className="text-2xl font-black mb-6">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder="Full Name *"
                                value={shippingInfo.name}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={shippingInfo.email}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone *"
                                value={shippingInfo.phone}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Pincode *"
                                value={shippingInfo.pincode}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Street Address *"
                                value={shippingInfo.street}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                                className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="City *"
                                value={shippingInfo.city}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="State *"
                                value={shippingInfo.state}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            onClick={() => setStep('payment')}
                            disabled={!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.street}
                            className="w-full mt-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                        >
                            Continue to Payment
                        </button>
                    </div>
                )}

                {/* Payment Method */}
                {step === 'payment' && (
                    <div className="bg-white rounded-3xl p-8">
                        <h2 className="text-2xl font-black mb-6">Payment Method</h2>
                        <div className="space-y-4 mb-6">
                            <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                    className="w-5 h-5"
                                />
                                <Banknote className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <p className="font-bold">Cash on Delivery</p>
                                    <p className="text-sm text-slate-500">Pay when you receive</p>
                                </div>
                            </label>
                            <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                    className="w-5 h-5"
                                />
                                <Wallet className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <p className="font-bold">UPI Payment</p>
                                    <p className="text-sm text-slate-500">Google Pay, PhonePe, Paytm</p>
                                </div>
                            </label>
                            <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="w-5 h-5"
                                />
                                <CreditCard className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <p className="font-bold">Credit/Debit Card</p>
                                    <p className="text-sm text-slate-500">Visa, Mastercard, RuPay</p>
                                </div>
                            </label>
                        </div>
                        <button
                            onClick={() => setStep('review')}
                            className="w-full px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Continue to Review
                        </button>
                    </div>
                )}

                {/* Review & Place Order */}
                {step === 'review' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8">
                            <h2 className="text-2xl font-black mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Subtotal</span>
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
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="text-xl font-black">Total</span>
                                    <span className="text-3xl font-black text-indigo-600">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className="w-full px-8 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors"
                        >
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
