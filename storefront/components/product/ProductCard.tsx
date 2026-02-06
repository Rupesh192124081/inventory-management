import React from 'react';
import { Item } from '../../types/storefront';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';

interface ProductCardProps {
    product: Item;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const toast = useToast();
    const [isWishlisted, setIsWishlisted] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product, null, 1);
        toast.success(`${product.name} added to cart!`);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsWishlisted(!isWishlisted);
        if (!isWishlisted) {
            toast.info('Added to wishlist');
        }
    };

    const discount = product.onSale && product.salePercentage
        ? Math.round(((product.purchasePrice - product.salePrice) / product.purchasePrice) * 100)
        : 0;

    // Use actual rating if available, otherwise show placeholder
    const rating = (product as any).rating || 4.5;
    const reviewCount = (product as any).reviewCount || 0;

    return (
        <a href={`/product/${product.id}`} className="group block">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2">
                {/* Image */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-400">{product.name[0]}</span>
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.newArrival && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">NEW</span>
                        )}
                        {product.onSale && discount > 0 && (
                            <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">{discount}% OFF</span>
                        )}
                        {product.stock <= product.minStock && product.stock > 0 && (
                            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">LOW STOCK</span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>

                    {/* Quick Add to Cart */}
                    {product.stock > 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Category */}
                    {product.category && (
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                            {product.category}
                        </p>
                    )}

                    {/* Name */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500">
                            {reviewCount > 0 ? `(${reviewCount})` : 'No reviews'}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-indigo-600">₹{product.salePrice.toLocaleString()}</span>
                                {product.onSale && (
                                    <span className="text-sm text-slate-400 line-through">₹{product.purchasePrice.toLocaleString()}</span>
                                )}
                            </div>
                            {product.stock === 0 ? (
                                <p className="text-xs font-bold text-rose-600 mt-1">Out of Stock</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1">{product.stock} in stock</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default ProductCard;
