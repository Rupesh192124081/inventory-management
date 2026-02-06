/**
 * Storefront Sync Service
 * Real-time synchronization between admin and storefront
 */

// Storage keys - matches admin
const ADMIN_STORAGE_KEYS = {
    ITEMS: 'vyapar_items',
    SALE_INVOICES: 'vyapar_sale_invoices',
    STOCK_LEDGER: 'vyapar_stock_ledger',
    BUSINESS_PROFILE: 'vyapar_profile',
};

// Storefront storage keys
const STOREFRONT_KEYS = {
    CART: 'storefront_cart',
    WISHLIST: 'storefront_wishlist',
    ORDERS: 'storefront_orders',
    CUSTOMER: 'storefront_customer',
};

export interface StockCheckResult {
    available: boolean;
    currentStock: number;
    message: string;
}

export interface SyncedProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    mrp: number;
    stock: number;
    images: string[];
    category: string;
    brand: string;
    hsnCode: string;
    unit: string;
    gstRate: number;
    isActive: boolean;
    variants?: Array<{
        id: string;
        name: string;
        price: number;
        stock: number;
    }>;
}

/**
 * Sync Service Class
 */
class StorefrontSyncService {
    private lastSyncTime: number = 0;
    private syncInterval: number = 5000; // 5 seconds

    /**
     * Get all synced products from admin inventory
     */
    getProducts(): SyncedProduct[] {
        const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ITEMS);
        if (!data) return [];

        const items = JSON.parse(data);
        return items
            .filter((item: any) => item.isActive !== false)
            .map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.sellingPrice,
                mrp: item.mrp || item.sellingPrice,
                stock: item.stock,
                images: item.images || [],
                category: item.category,
                brand: item.brand || '',
                hsnCode: item.hsnCode,
                unit: item.unit,
                gstRate: item.gstRate,
                isActive: item.isActive !== false,
                variants: item.variants?.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    price: v.price,
                    stock: v.stock,
                })),
            }));
    }

    /**
     * Get single product with latest stock
     */
    getProduct(productId: string): SyncedProduct | null {
        const products = this.getProducts();
        return products.find(p => p.id === productId) || null;
    }

    /**
     * Check stock availability (REAL-TIME)
     */
    checkStock(productId: string, quantity: number, variantId?: string): StockCheckResult {
        const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ITEMS);
        if (!data) {
            return { available: false, currentStock: 0, message: 'Product not found' };
        }

        const items = JSON.parse(data);
        const item = items.find((i: any) => i.id === productId);

        if (!item) {
            return { available: false, currentStock: 0, message: 'Product not found' };
        }

        let currentStock: number;

        if (variantId && item.variants) {
            const variant = item.variants.find((v: any) => v.id === variantId);
            if (!variant) {
                return { available: false, currentStock: 0, message: 'Variant not found' };
            }
            currentStock = variant.stock;
        } else {
            currentStock = item.stock;
        }

        if (currentStock < quantity) {
            return {
                available: false,
                currentStock,
                message: currentStock === 0
                    ? 'Out of stock'
                    : `Only ${currentStock} available`,
            };
        }

        return {
            available: true,
            currentStock,
            message: 'In stock',
        };
    }

    /**
     * Validate entire cart stock
     */
    validateCart(cartItems: Array<{ productId: string; quantity: number; variantId?: string }>): {
        valid: boolean;
        items: Array<{ productId: string; valid: boolean; available: number; requested: number }>;
    } {
        const results = cartItems.map(item => {
            const check = this.checkStock(item.productId, item.quantity, item.variantId);
            return {
                productId: item.productId,
                valid: check.available,
                available: check.currentStock,
                requested: item.quantity,
            };
        });

        return {
            valid: results.every(r => r.valid),
            items: results,
        };
    }

    /**
     * Get business profile for invoice/receipt
     */
    getBusinessProfile(): any {
        const data = localStorage.getItem(ADMIN_STORAGE_KEYS.BUSINESS_PROFILE);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Generate WhatsApp share link for order
     */
    generateWhatsAppLink(order: {
        orderId: string;
        customerName: string;
        items: Array<{ name: string; quantity: number; price: number }>;
        total: number;
        phone?: string;
    }): string {
        const profile = this.getBusinessProfile();
        const businessPhone = profile?.phone || '';

        // Build message
        let message = `🛒 *Order Confirmation*\n`;
        message += `Order ID: ${order.orderId}\n`;
        message += `Customer: ${order.customerName}\n\n`;
        message += `*Items:*\n`;

        order.items.forEach((item, i) => {
            message += `${i + 1}. ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}\n`;
        });

        message += `\n*Total: ₹${order.total.toLocaleString()}*\n`;
        message += `\nThank you for your order! 🙏`;

        // Encode message
        const encoded = encodeURIComponent(message);
        const phone = order.phone || businessPhone;

        return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`;
    }

    /**
     * Create order record
     */
    createOrder(orderData: {
        customer: any;
        items: any[];
        shippingAddress: any;
        paymentMethod: string;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
    }): { success: boolean; orderId?: string; whatsappLink?: string } {
        // Validate stock first
        const validation = this.validateCart(
            orderData.items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                variantId: item.variantId,
            }))
        );

        if (!validation.valid) {
            return { success: false };
        }

        // Generate order ID
        const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

        // Create order
        const order = {
            id: orderId,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        // Save to storefront orders
        const existingOrders = JSON.parse(localStorage.getItem(STOREFRONT_KEYS.ORDERS) || '[]');
        existingOrders.push(order);
        localStorage.setItem(STOREFRONT_KEYS.ORDERS, JSON.stringify(existingOrders));

        // Generate WhatsApp link
        const whatsappLink = this.generateWhatsAppLink({
            orderId,
            customerName: orderData.customer?.name || 'Customer',
            items: orderData.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            total: orderData.total,
            phone: orderData.customer?.phone,
        });

        return { success: true, orderId, whatsappLink };
    }

    /**
     * Get customer orders
     */
    getOrders(): any[] {
        const data = localStorage.getItem(STOREFRONT_KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get products by category
     */
    getProductsByCategory(category: string): SyncedProduct[] {
        return this.getProducts().filter(p => p.category === category);
    }

    /**
     * Search products
     */
    searchProducts(query: string): SyncedProduct[] {
        const q = query.toLowerCase();
        return this.getProducts().filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q)
        );
    }

    /**
     * Get in-stock products only
     */
    getInStockProducts(): SyncedProduct[] {
        return this.getProducts().filter(p => p.stock > 0);
    }

    /**
     * Get low stock products (for admin notification)
     */
    getLowStockProducts(threshold: number = 10): SyncedProduct[] {
        return this.getProducts().filter(p => p.stock > 0 && p.stock <= threshold);
    }

    /**
     * Check if sync is needed
     */
    needsSync(): boolean {
        return Date.now() - this.lastSyncTime > this.syncInterval;
    }

    /**
     * Mark sync complete
     */
    markSynced(): void {
        this.lastSyncTime = Date.now();
    }
}

// Export singleton
export const storefrontSyncService = new StorefrontSyncService();
export default storefrontSyncService;
