import React from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-20">
            <div className="container mx-auto px-4 text-center">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[180px] md:text-[250px] font-black text-slate-100 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center">
                            <Search className="w-16 h-16 text-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl md:text-5xl font-black mb-4">Page Not Found</h1>
                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </a>
                    <a
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 bg-white rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Browse Products
                    </a>
                </div>

                {/* Help text */}
                <p className="text-sm text-slate-400 mt-12">
                    If you believe this is an error, please contact our support team.
                </p>
            </div>
        </div>
    );
};

export default NotFound;
