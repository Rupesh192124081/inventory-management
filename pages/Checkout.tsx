import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Truck, ShieldCheck } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
}

const Checkout: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [step, setStep] = useState(1);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        paymentMethod: 'cod'
    });

    useEffect(() => {
        try {
            const cart = JSON.parse(localStorage.getItem('storefront_cart') || '[]');
            setCartItems(cart);
        } catch {
            setCartItems([]);
        }
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const placeOrder = () => {
        // Create order and deduct stock
        const items = JSON.parse(localStorage.getItem('vyapar_items') || '[]');

        cartItems.forEach(cartItem => {
            const item = items.find((i: any) => i.id === cartItem.id);
            if (item) {
                item.stock = Math.max(0, item.stock - cartItem.quantity);
            }
        });

        localStorage.setItem('vyapar_items', JSON.stringify(items));

        // Clear cart
        localStorage.setItem('storefront_cart', '[]');
        window.dispatchEvent(new CustomEvent('cart-updated'));

        setOrderPlaced(true);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">Order Placed!</h2>
                    <p className="text-slate-500 mb-8">
                        Thank you for your order. Your items will be delivered soon.
                    </p>
                    <a href="/products" className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No items to checkout</h2>
                    <a href="/products" className="text-indigo-600 font-bold hover:underline">
                        Browse Products
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-black mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    {['Shipping', 'Payment', 'Confirm'].map((label, i) => (
                        <React.Fragment key={label}>
                            <div className={`flex items-center ${step > i + 1 ? 'text-green-600' : step === i + 1 ? 'text-indigo-600' : 'text-slate-300'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > i + 1 ? 'bg-green-100' : step === i + 1 ? 'bg-indigo-100' : 'bg-slate-100'
                                    }`}>
                                    {step > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
                                </div>
                                <span className="ml-2 font-bold hidden sm:block">{label}</span>
                            </div>
                            {i < 2 && <div className={`w-16 h-1 mx-4 rounded ${step > i + 1 ? 'bg-green-300' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            {step === 1 && (
                                <>
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <Truck className="w-6 h-6 text-indigo-600" /> Shipping Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            name="pincode"
                                            placeholder="PIN Code"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <textarea
                                            name="address"
                                            placeholder="Complete Address"
                                            rows={3}
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 md:col-span-2"
                                        />
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                                    >
                                        Continue to Payment
                                    </button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-indigo-600" /> Payment Method
                                    </h2>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                                            { id: 'upi', label: 'UPI Payment', desc: 'PhonePe, GPay, Paytm' },
                                            { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay' }
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.id
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={formData.paymentMethod === method.id}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 text-indigo-600"
                                                />
                                                <div>
                                                    <p className="font-bold">{method.label}</p>
                                                    <p className="text-sm text-slate-500">{method.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            Review Order
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <ShieldCheck className="w-6 h-6 text-indigo-600" /> Review Order
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl">
                                            <h3 className="font-bold mb-2">Shipping To</h3>
                                            <p className="text-slate-600">{formData.name}</p>
                                            <p className="text-slate-600">{formData.address}, {formData.city} - {formData.pincode}</p>
                                            <p className="text-slate-600">{formData.phone}</p>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl">
                                            <h3 className="font-bold mb-2">Payment</h3>
                                            <p className="text-slate-600">
                                                {formData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                                    formData.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl">
                                            <h3 className="font-bold mb-3">Items</h3>
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex justify-between py-2">
                                                    <span className="text-slate-600">{item.name} x {item.quantity}</span>
                                                    <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={placeOrder}
                                            className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors"
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="text-xl font-black mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-slate-600">{item.name} x {item.quantity}</span>
                                        <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 mt-4 pt-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-black">Total</span>
                                    <span className="font-black text-indigo-600">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
