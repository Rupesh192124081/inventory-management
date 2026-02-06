import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-white mt-20">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-black text-2xl">V</span>
                            </div>
                            <div>
                                <h3 className="font-black text-xl">Vyapar Store</h3>
                                <p className="text-xs text-slate-400">Premium Products</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Your trusted destination for quality products at great prices. Shop with confidence.
                        </p>
                        <div className="flex gap-3">
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
                        <h4 className="font-black text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><a href="/products" className="text-slate-400 hover:text-white transition-colors">All Products</a></li>
                            <li><a href="/products?featured=true" className="text-slate-400 hover:text-white transition-colors">Featured</a></li>
                            <li><a href="/products?sale=true" className="text-slate-400 hover:text-white transition-colors">Sale</a></li>
                            <li><a href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-black text-lg mb-6">Customer Service</h4>
                        <ul className="space-y-3">
                            <li><a href="/account" className="text-slate-400 hover:text-white transition-colors">My Account</a></li>
                            <li><a href="/orders" className="text-slate-400 hover:text-white transition-colors">Track Order</a></li>
                            <li><a href="/help" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="/returns" className="text-slate-400 hover:text-white transition-colors">Returns</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-black text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="text-slate-400 text-sm">123 Business Hub, Silicon Valley, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-slate-400 text-sm">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-slate-400 text-sm">support@vyaparstore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">© 2026 Vyapar Store. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                        <a href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
