import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'admin-login' | 'admin-dashboard' | 'not-found';

interface RouteResult {
    page: Page;
    productId?: string;
}

// Centralized route matching function
const getRouteFromPath = (path: string, isAdminAuthenticated: boolean): RouteResult => {
    if (path === '/' || path === '/home') {
        return { page: 'home' };
    }

    if (path.startsWith('/product/') && path !== '/products') {
        const productId = path.split('/product/')[1];
        return { page: 'product-detail', productId };
    }

    if (path.startsWith('/products')) {
        return { page: 'products' };
    }

    if (path === '/cart') {
        return { page: 'cart' };
    }

    if (path === '/checkout') {
        return { page: 'checkout' };
    }

    if (path === '/admin/login') {
        return { page: 'admin-login' };
    }

    if (path === '/admin' || path === '/admin/dashboard') {
        if (isAdminAuthenticated) {
            return { page: 'admin-dashboard' };
        }
        return { page: 'admin-login' };
    }

    return { page: 'not-found' };
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentProductId, setCurrentProductId] = useState<string>('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    // Navigation function - single source of truth
    const navigateTo = useCallback((path: string) => {
        const route = getRouteFromPath(path, isAdminAuthenticated);

        if (route.productId) {
            setCurrentProductId(route.productId);
        }

        setCurrentPage(route.page);

        // Redirect to login if trying to access admin without auth
        if ((path === '/admin' || path === '/admin/dashboard') && !isAdminAuthenticated) {
            window.history.replaceState({}, '', '/admin/login');
        }
    }, [isAdminAuthenticated]);

    // Handle initial load and popstate
    useEffect(() => {
        const handleNavigation = () => {
            navigateTo(window.location.pathname);
        };

        handleNavigation();
        window.addEventListener('popstate', handleNavigation);
        return () => window.removeEventListener('popstate', handleNavigation);
    }, [navigateTo]);

    // Intercept link clicks for client-side navigation
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const path = link.pathname;
                window.history.pushState({}, '', path);
                navigateTo(path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [navigateTo]);

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
        <ToastProvider>
            <ErrorBoundary>
                <div className="min-h-screen flex flex-col">
                    {!isAdminPage && <Header />}
                    <main className="flex-1">
                        <ErrorBoundary>
                            {currentPage === 'home' && <Home />}
                            {currentPage === 'products' && <Products />}
                            {currentPage === 'product-detail' && <ProductDetail productId={currentProductId} />}
                            {currentPage === 'cart' && <Cart />}
                            {currentPage === 'checkout' && <Checkout />}
                            {currentPage === 'admin-login' && <AdminLogin onLogin={handleAdminLogin} />}
                            {currentPage === 'admin-dashboard' && <AdminDashboard onLogout={handleAdminLogout} />}
                            {currentPage === 'not-found' && <NotFound />}
                        </ErrorBoundary>
                    </main>
                    {!isAdminPage && <Footer />}
                </div>
            </ErrorBoundary>
        </ToastProvider>
    );
};

export default App;
