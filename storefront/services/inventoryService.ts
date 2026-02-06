// Service to interact with inventory data (shared via localStorage)
import { Item, CartItem, Order, Customer } from '../types/storefront';

const STORAGE_KEYS = {
    PRODUCTS: 'vyapar_items',
    CATEGORIES: 'vyapar_categories',
    ORDERS: 'vyapar_orders',
    CUSTOMERS: 'vyapar_customers',
    CART_PREFIX: 'vyapar_cart_',
    CURRENT_CUSTOMER: 'vyapar_current_customer',
};

export const inventoryService = {
    // Get all products
    getProducts: (): Item[] => {
        const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    },

    // Get product by ID
    getProduct: (id: string): Item | null => {
        const products = inventoryService.getProducts();
        return products.find(p => p.id === id) || null;
    },

    // Get featured products
    getFeaturedProducts: (): Item[] => {
        return inventoryService.getProducts().filter(p => p.featured && p.stock > 0);
    },

    // Get products by category
    getProductsByCategory: (categoryId: string): Item[] => {
        return inventoryService.getProducts().filter(p => p.category === categoryId && p.stock > 0);
    },

    // Search products
    searchProducts: (query: string): Item[] => {
        const products = inventoryService.getProducts();
        const lowerQuery = query.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    // Get cart for current customer
    getCart: (customerId: string): CartItem[] => {
        const data = localStorage.getItem(STORAGE_KEYS.CART_PREFIX + customerId);
        return data ? JSON.parse(data) : [];
    },

    // Save cart
    saveCart: (customerId: string, cart: CartItem[]): void => {
        localStorage.setItem(STORAGE_KEYS.CART_PREFIX + customerId, JSON.stringify(cart));
    },

    // Get current customer
    getCurrentCustomer: (): Customer | null => {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_CUSTOMER);
        return data ? JSON.parse(data) : null;
    },

    // Set current customer
    setCurrentCustomer: (customer: Customer): void => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(customer));
    },

    // Get all orders
    getOrders: (): Order[] => {
        const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    },

    // Save order
    saveOrder: (order: Order): void => {
        const orders = inventoryService.getOrders();
        orders.push(order);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },

    // Get customer orders
    getCustomerOrders: (customerId: string): Order[] => {
        return inventoryService.getOrders().filter(o => o.customerId === customerId);
    },

    // Update stock after order
    updateStock: (itemId: string, variantId: string | undefined, quantity: number): void => {
        const products = inventoryService.getProducts();
        const productIndex = products.findIndex(p => p.id === itemId);

        if (productIndex !== -1) {
            if (variantId && products[productIndex].variants) {
                const variantIndex = products[productIndex].variants!.findIndex(v => v.id === variantId);
                if (variantIndex !== -1) {
                    products[productIndex].variants![variantIndex].stock -= quantity;
                }
            } else {
                products[productIndex].stock -= quantity;
            }
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        }
    },
};
