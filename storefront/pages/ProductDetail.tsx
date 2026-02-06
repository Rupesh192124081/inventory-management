import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, Shield, Truck, RotateCcw, Check } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { Item } from '../types/storefront';
import { useCart } from '../hooks/useCart';
import { useToast } from '../contexts/ToastContext';

interface ProductDetailProps {
    productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
    const [product, setProduct] = useState<Item | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addToCart } = useCart();
    const toast = useToast();

    useEffect(() => {
        const item = inventoryService.getProduct(productId);
        setProduct(item);
        if (item?.variants && item.variants.length > 0) {
            setSelectedVariant(item.variants[0].id);
        }
    }, [productId]);

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black mb-4">Product Not Found</h2>
                    <a href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Products
                    </a>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        const variant = selectedVariant ? product.variants?.find(v => v.id === selectedVariant) : null;
        addToCart(product, variant, quantity);
        toast.success(`${quantity} x ${product.name} added to cart!`);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        if (!isWishlisted) {
            toast.info('Added to wishlist');
        } else {
            toast.info('Removed from wishlist');
        }
    };

    const currentPrice = selectedVariant
        ? product.variants?.find(v => v.id === selectedVariant)?.salePrice || product.salePrice
        : product.salePrice;

    const currentStock = selectedVariant
        ? product.variants?.find(v => v.id === selectedVariant)?.stock || product.stock
        : product.stock;

    // Use actual rating if available
    const rating = (product as any).rating || 4.5;
    const reviewCount = (product as any).reviewCount || 128;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <a href="/products" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 font-bold">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Products
                </a>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-3xl p-8">
                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-8xl font-black text-slate-300">{product.name[0]}</span>
                                </div>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2">
                            {product.newArrival && (
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">NEW ARRIVAL</span>
                            )}
                            {product.onSale && (
                                <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">ON SALE</span>
                            )}
                            {product.featured && (
                                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">FEATURED</span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Category */}
                        {product.category && (
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">
                                {product.category}
                            </p>
                        )}

                        {/* Name */}
                        <h1 className="text-4xl md:text-5xl font-black mb-4">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-slate-600">
                                ({rating} stars · {reviewCount} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-5xl font-black text-indigo-600">₹{currentPrice.toLocaleString()}</span>
                                {product.onSale && (
                                    <span className="text-2xl text-slate-400 line-through">₹{product.purchasePrice.toLocaleString()}</span>
                                )}
                            </div>
                            {currentStock > 0 ? (
                                <p className="text-green-600 font-bold">✓ In Stock ({currentStock} available)</p>
                            ) : (
                                <p className="text-rose-600 font-bold">✗ Out of Stock</p>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            {product.description || 'No description available.'}
                        </p>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-black text-lg mb-3">Select Variant</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant.id)}
                                            className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${selectedVariant === variant.id
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                : 'border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            {variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-8">
                            <h3 className="font-black text-lg mb-3">Quantity</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-16 text-center text-2xl font-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                    disabled={quantity >= currentStock}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${quantity >= currentStock
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                        }`}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                {quantity >= currentStock && (
                                    <span className="text-xs text-amber-600 font-medium ml-2">Max available</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock === 0}
                                className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${addedToCart
                                        ? 'bg-green-600 text-white'
                                        : currentStock === 0
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Added!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleWishlist}
                                className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${isWishlisted
                                    ? 'border-rose-500 bg-rose-50'
                                    : 'border-slate-200 hover:border-rose-300'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Free Shipping</p>
                                    <p className="text-xs text-slate-500">On orders over ₹500</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Secure Payment</p>
                                    <p className="text-xs text-slate-500">100% protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <RotateCcw className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Easy Returns</p>
                                    <p className="text-xs text-slate-500">30-day policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
