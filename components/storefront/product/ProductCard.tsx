import React from 'react';
import { ShoppingCart, Star, Heart } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    stock: number;
    rating?: number;
    featured?: boolean;
    newArrival?: boolean;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const cart = JSON.parse(localStorage.getItem('storefront_cart') || '[]');
        const existing = cart.find((item: any) => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                stock: product.stock
            });
        }

        localStorage.setItem('storefront_cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated'));
        alert('Added to cart!');
    };

    return (
        <a href={`/product/${product.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
            {/* Image Container */}
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                        <span className="text-4xl font-black text-indigo-300">{product.name[0]}</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discount > 0 && (
                        <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                            -{discount}%
                        </span>
                    )}
                    {product.newArrival && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            NEW
                        </span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                            Low Stock
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>

                {/* Add to Cart Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={addToCart}
                        disabled={product.stock === 0}
                        className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${product.stock === 0
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {product.category && (
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        {product.category}
                    </p>
                )}
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">({product.rating})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-indigo-600">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                </div>

                {/* Stock Status */}
                <p className={`text-xs font-bold mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
            </div>
        </a>
    );
};

export default ProductCard;
