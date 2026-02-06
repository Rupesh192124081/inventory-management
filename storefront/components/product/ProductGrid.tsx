import React from 'react';
import { Item } from '../../types/storefront';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: Item[];
    loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-200 animate-pulse">
                        <div className="aspect-square bg-slate-200" />
                        <div className="p-5 space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                            <div className="h-6 bg-slate-200 rounded w-3/4" />
                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                            <div className="h-8 bg-slate-200 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-2xl font-black mb-2">No Products Found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
