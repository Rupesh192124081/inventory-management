import React from 'react';
import { ArrowRight, Star, TrendingUp, Shield, Truck, Award } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import ProductGrid from '../components/product/ProductGrid';

const Home: React.FC = () => {
    const [featuredProducts, setFeaturedProducts] = React.useState(inventoryService.getFeaturedProducts().slice(0, 8));
    const [newArrivals, setNewArrivals] = React.useState(
        inventoryService.getProducts().filter(p => p.newArrival).slice(0, 4)
    );

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[600px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                    <div className="max-w-2xl text-white">
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
                            ✨ New Collection Available
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                            Premium Products<br />
                            <span className="text-indigo-200">Delivered Fast</span>
                        </h1>
                        <p className="text-xl mb-8 text-indigo-100 leading-relaxed">
                            Discover our curated collection of quality products with unbeatable prices and lightning-fast delivery.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="/products" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl flex items-center gap-2">
                                Shop Now <ArrowRight className="w-5 h-5" />
                            </a>
                            <a href="/products?featured=true" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                                View Featured
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                                <Truck className="w-7 h-7 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Free Shipping</h3>
                                <p className="text-slate-500 text-sm">On orders over ₹500</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                                <Shield className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Secure Payment</h3>
                                <p className="text-slate-500 text-sm">100% protected</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                                <Award className="w-7 h-7 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Quality Products</h3>
                                <p className="text-slate-500 text-sm">Verified & authentic</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                                <TrendingUp className="w-7 h-7 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Best Prices</h3>
                                <p className="text-slate-500 text-sm">Competitive rates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Featured Products</h2>
                        <p className="text-slate-500 text-lg">Handpicked items just for you</p>
                    </div>
                    <ProductGrid products={featuredProducts} />
                    <div className="text-center mt-12">
                        <a href="/products?featured=true" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                            View All Featured <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                                NEW ARRIVALS
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">Just Landed</h2>
                            <p className="text-slate-500 text-lg">Check out our latest additions</p>
                        </div>
                        <ProductGrid products={newArrivals} />
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Shop by Category</h2>
                        <p className="text-slate-500 text-lg">Find what you're looking for</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty', 'Toys', 'Groceries'].map((category, i) => (
                            <a
                                key={category}
                                href={`/products?category=${category.toLowerCase()}`}
                                className="group relative h-48 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                <div className="relative h-full flex items-center justify-center">
                                    <h3 className="text-white font-black text-2xl">{category}</h3>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-indigo-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">What Our Customers Say</h2>
                        <p className="text-slate-500 text-lg">Trusted by thousands of happy customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Rajesh Kumar', review: 'Amazing quality products and super fast delivery! Highly recommended.', rating: 5 },
                            { name: 'Priya Sharma', review: 'Best online shopping experience. Great customer service!', rating: 5 },
                            { name: 'Amit Patel', review: 'Competitive prices and authentic products. Will shop again!', rating: 5 },
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 shadow-lg">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 mb-6 leading-relaxed">"{testimonial.review}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="font-black text-indigo-600">{testimonial.name[0]}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">Verified Buyer</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Start Shopping?</h2>
                    <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and experience premium quality products at unbeatable prices.
                    </p>
                    <a href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
                        Browse All Products <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Home;
