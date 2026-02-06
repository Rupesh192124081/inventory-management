import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-black text-xl">V</span>
                            </div>
                            <div>
                                <h2 className="font-black text-lg">Vyapar <span className="text-indigo-400">Store</span></h2>
                            </div>
                        </div>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Your one-stop destination for premium quality products at unbeatable prices.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-black text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/products" className="text-slate-400 hover:text-white transition-colors">Products</a></li>
                            <li><a href="/cart" className="text-slate-400 hover:text-white transition-colors">Cart</a></li>
                            <li><a href="/admin" className="text-slate-400 hover:text-white transition-colors">Admin</a></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-black text-lg mb-6">Categories</h3>
                        <ul className="space-y-3">
                            <li><a href="/products?category=electronics" className="text-slate-400 hover:text-white transition-colors">Electronics</a></li>
                            <li><a href="/products?category=fashion" className="text-slate-400 hover:text-white transition-colors">Fashion</a></li>
                            <li><a href="/products?category=home" className="text-slate-400 hover:text-white transition-colors">Home & Living</a></li>
                            <li><a href="/products?category=sports" className="text-slate-400 hover:text-white transition-colors">Sports</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-black text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                                <span className="text-slate-400">123 Business Hub, Silicon Valley, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-slate-400">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-slate-400">support@vyaparstore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
                    <p>© 2026 Vyapar Store. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
