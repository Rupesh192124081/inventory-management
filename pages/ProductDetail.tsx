import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Minus, Plus, ArrowLeft, Check } from 'lucide-react';

interface ProductDetailProps {
    productId: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    stock: number;
    rating?: number;
    description?: string;
    unit?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        try {
            const items = JSON.parse(localStorage.getItem('vyapar_items') || '[]');
            const item = items.find((i: any) => i.id === productId);
            if (item) {
                setProduct({
                    id: item.id,
                    name: item.name,
                    price: item.salePrice,
                    originalPrice: Math.round(item.salePrice * 1.2),
                    image: `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 100000000)}?w=600`,
                    category: item.unit || 'General',
                    stock: item.stock,
                    rating: 4.5,
                    description: `Premium quality ${item.name}. Perfect for your needs.`,
                    unit: item.unit
                });
            }
        } catch {
            setProduct(null);
        }
    }, [productId]);

    const addToCart = () => {
        if (!product) return;

        const cart = JSON.parse(localStorage.getItem('storefront_cart') || '[]');
        const existing = cart.find((item: any) => item.id === product.id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                stock: product.stock
            });
        }

        localStorage.setItem('storefront_cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated'));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Product not found</h2>
                    <a href="/products" className="text-indigo-600 font-bold hover:underline">
                        ← Back to Products
                    </a>
                </div>
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <a href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </a>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="relative aspect-square bg-slate-100">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-8xl font-black text-slate-200">{product.name[0]}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <span className="absolute top-6 left-6 px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-full">
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-8 lg:p-12">
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">
                                {product.category}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black mb-4">{product.name}</h1>

                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-slate-500">({product.rating} rating)</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-end gap-4 mb-6">
                                <span className="text-4xl font-black text-indigo-600">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xl text-slate-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2 mb-8">
                                <span className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-6 mb-8">
                                <span className="font-bold text-slate-700">Quantity:</span>
                                <div className="flex items-center bg-slate-100 rounded-xl">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-200 rounded-l-xl transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-200 rounded-r-xl transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${addedToCart
                                            ? 'bg-green-500 text-white'
                                            : product.stock === 0
                                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {addedToCart ? (
                                        <><Check className="w-5 h-5" /> Added to Cart!</>
                                    ) : (
                                        <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                                    )}
                                </button>
                                <button className="w-14 h-14 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
