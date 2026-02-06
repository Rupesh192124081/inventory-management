import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
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

    // Read URL search params on mount and when URL changes
    useEffect(() => {
        const updateFiltersFromURL = () => {
            const params = new URLSearchParams(window.location.search);
            const search = params.get('search') || '';
            const category = params.get('category') || '';
            const featured = params.get('featured');
            const sale = params.get('sale');

            setFilters(prev => ({
                ...prev,
                search,
                category: category.toLowerCase(),
            }));
        };

        updateFiltersFromURL();
        window.addEventListener('popstate', updateFiltersFromURL);
        return () => window.removeEventListener('popstate', updateFiltersFromURL);
    }, []);

    const { products, loading } = useProducts(filters, sortBy);

    // Filter products by search query
    const filteredProducts = useMemo(() => {
        if (!filters.search) return products;

        const searchLower = filters.search.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }, [products, filters.search]);

    const clearSearch = () => {
        setFilters(prev => ({ ...prev, search: '' }));
        window.history.pushState({}, '', '/products');
    };

    const categoryOptions = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books'];

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        {filters.search ? `Search: "${filters.search}"` : 'All Products'}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {filters.search
                            ? `Found ${filteredProducts.length} products matching your search`
                            : 'Discover our complete collection'}
                    </p>
                    {filters.search && (
                        <button
                            onClick={clearSearch}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear Search
                        </button>
                    )}
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-3xl p-6 sticky top-24">
                            <h3 className="font-black text-lg mb-6">Filters</h3>

                            {/* Search within results */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Search</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter products..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Category</h4>
                                <div className="space-y-2">
                                    {categoryOptions.map((cat) => (
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
                                onClick={() => {
                                    setFilters({ category: '', priceRange: [0, 50000], inStock: true, search: '' });
                                    window.history.pushState({}, '', '/products');
                                }}
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
                                    <span className="font-bold">{filteredProducts.length}</span> products found
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
                        <ProductGrid products={filteredProducts} loading={loading} />
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

                            {/* Search */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Search</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter products..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-3">Category</h4>
                                <div className="space-y-2">
                                    {categoryOptions.map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category-mobile"
                                                checked={filters.category === (cat === 'All' ? '' : cat.toLowerCase())}
                                                onChange={() => {
                                                    setFilters({ ...filters, category: cat === 'All' ? '' : cat.toLowerCase() });
                                                }}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFilters(false)}
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
