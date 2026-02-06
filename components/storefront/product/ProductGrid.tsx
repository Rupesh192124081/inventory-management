import React from 'react';
import ProductCard from './ProductCard';

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

interface ProductGridProps {
    products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p className="text-lg">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
