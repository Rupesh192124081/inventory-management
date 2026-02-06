import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';

const Products: React.FC = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        priceRange: [0, 50000] as [number, number],
        inStock: true,
        search: '',
    });
    const [sortBy, setSortBy] = useState('popular');

    const { products, loading } = useProducts(filters, sortBy);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">All Products</h1>
                    <p className="text-slate-500 text-lg">Discover our complete collection</p>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-3xl p-6 sticky top-24">
                            <h3 className="font-black text-lg mb-6">Filters</h3>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Category</h4>
                                <div className="space-y-2">
                                    {['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={filters.category === (cat === 'All' ? '' : cat.toLowerCase())}
                                                onChange={() => setFilters({ ...filters, category: cat === 'All' ? '' : cat.toLowerCase() })}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Price Range</h4>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50000"
                                        value={filters.priceRange[1]}
                                        onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>₹0</span>
                                        <span>₹{filters.priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm font-bold">In Stock Only</span>
                                </label>
                            </div>

                            {/* Reset Filters */}
                            <button
                                onClick={() => setFilters({ category: '', priceRange: [0, 50000], inStock: true, search: '' })}
                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                </button>
                                <p className="text-slate-600">
                                    <span className="font-bold">{products.length}</span> products found
                                </p>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:border-indigo-600 focus:outline-none"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>

                        {/* Products */}
                        <ProductGrid products={products} loading={loading} />
                    </main>
                </div>

                {/* Mobile Filters Modal */}
                {showFilters && (
                    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg">Filters</h3>
                                <button onClick={() => setShowFilters(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Same filters as desktop */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Category</h4>
                                <div className="space-y-2">
                                    {['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category-mobile"
                                                checked={filters.category === (cat === 'All' ? '' : cat.toLowerCase())}
                                                onChange={() => {
                                                    setFilters({ ...filters, category: cat === 'All' ? '' : cat.toLowerCase() });
                                                    setShowFilters(false);
                                                }}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setFilters({ category: '', priceRange: [0, 50000], inStock: true, search: '' });
                                    setShowFilters(false);
                                }}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
