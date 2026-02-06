import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Grid, List } from 'lucide-react';
import ProductGrid from '../components/storefront/product/ProductGrid';

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

// Get products from localStorage
const getProducts = (): Product[] => {
    try {
        const items = JSON.parse(localStorage.getItem('vyapar_items') || '[]');
        return items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.salePrice,
            originalPrice: Math.round(item.salePrice * 1.2),
            image: `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 100000000)}?w=400`,
            category: item.unit || 'General',
            stock: item.stock,
            rating: 4 + Math.random(),
            featured: item.stock > 20,
            newArrival: item.stock > 50
        }));
    } catch {
        return [];
    }
};

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadedProducts = getProducts();
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
    }, []);

    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, sortBy]);

    const categories = ['all', ...new Set(products.map(p => p.category?.toLowerCase() || 'general'))];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">All Products</h1>
                    <p className="text-indigo-100 text-lg">Discover our complete collection</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters Bar */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>

                    {/* Category Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-sm font-bold text-slate-500 mb-3">Categories</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500">
                        Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> products
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-slate-400 mb-4">No products found</p>
                        {products.length === 0 ? (
                            <p className="text-slate-500">
                                Visit the <a href="/admin" className="text-indigo-600 font-bold">Admin Dashboard</a> to add products.
                            </p>
                        ) : (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
