import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'admin-login' | 'admin-dashboard';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentProductId, setCurrentProductId] = useState<string>('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    // Simple client-side routing
    React.useEffect(() => {
        const handleNavigation = () => {
            const path = window.location.pathname;
            if (path === '/' || path === '/home') setCurrentPage('home');
            else if (path.startsWith('/product/') && path !== '/products') {
                const productId = path.split('/product/')[1];
                setCurrentProductId(productId);
                setCurrentPage('product-detail');
            }
            else if (path.startsWith('/products')) setCurrentPage('products');
            else if (path === '/cart') setCurrentPage('cart');
            else if (path === '/checkout') setCurrentPage('checkout');
            else if (path === '/admin/login') setCurrentPage('admin-login');
            else if (path === '/admin' || path === '/admin/dashboard') {
                if (isAdminAuthenticated) {
                    setCurrentPage('admin-dashboard');
                } else {
                    setCurrentPage('admin-login');
                    window.history.pushState({}, '', '/admin/login');
                }
            }
        };

        handleNavigation();
        window.addEventListener('popstate', handleNavigation);
        return () => window.removeEventListener('popstate', handleNavigation);
    }, [isAdminAuthenticated]);

    // Intercept link clicks for client-side navigation
    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const path = link.pathname;
                window.history.pushState({}, '', path);

                if (path === '/' || path === '/home') setCurrentPage('home');
                else if (path.startsWith('/product/') && path !== '/products') {
                    const productId = path.split('/product/')[1];
                    setCurrentProductId(productId);
                    setCurrentPage('product-detail');
                }
                else if (path.startsWith('/products')) setCurrentPage('products');
                else if (path === '/cart') setCurrentPage('cart');
                else if (path === '/checkout') setCurrentPage('checkout');
                else if (path === '/admin/login') setCurrentPage('admin-login');
                else if (path === '/admin' || path === '/admin/dashboard') {
                    if (isAdminAuthenticated) {
                        setCurrentPage('admin-dashboard');
                    } else {
                        setCurrentPage('admin-login');
                        window.history.pushState({}, '', '/admin/login');
                    }
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isAdminAuthenticated]);

    const handleAdminLogin = () => {
        setIsAdminAuthenticated(true);
        setCurrentPage('admin-dashboard');
        window.history.pushState({}, '', '/admin/dashboard');
    };

    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        setCurrentPage('home');
        window.history.pushState({}, '', '/');
    };

    // Don't show header/footer on admin pages
    const isAdminPage = currentPage === 'admin-login' || currentPage === 'admin-dashboard';

    return (
        <div className="min-h-screen flex flex-col">
            {!isAdminPage && <Header />}
            <main className="flex-1">
                {currentPage === 'home' && <Home />}
                {currentPage === 'products' && <Products />}
                {currentPage === 'product-detail' && <ProductDetail productId={currentProductId} />}
                {currentPage === 'cart' && <Cart />}
                {currentPage === 'checkout' && <Checkout />}
                {currentPage === 'admin-login' && <AdminLogin onLogin={handleAdminLogin} />}
                {currentPage === 'admin-dashboard' && <AdminDashboard onLogout={handleAdminLogout} />}
            </main>
            {!isAdminPage && <Footer />}
        </div>
    );
};

export default App;
