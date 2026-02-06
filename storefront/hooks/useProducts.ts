import { useState, useEffect } from 'react';
import { Item } from '../types/storefront';
import { inventoryService } from '../services/inventoryService';
import { seedDemoData } from '../services/demoData';

interface Filters {
    category?: string;
    priceRange?: [number, number];
    inStock?: boolean;
    search?: string;
}

export const useProducts = (filters?: Filters, sortBy: string = 'popular') => {
    const [products, setProducts] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ensure demo data is seeded
        const hasSeeded = localStorage.getItem('demo_data_seeded');
        if (!hasSeeded) {
            seedDemoData();
            localStorage.setItem('demo_data_seeded', 'true'); // Mark as seeded
        }

        setLoading(true);
        let allProducts: Item[] = inventoryService.getProducts();

        // If no products found, seed demo data
        if (allProducts.length === 0) {
            seedDemoData();
            allProducts = inventoryService.getProducts();
        }

        let filtered = allProducts;

        // Apply filters
        if (filters?.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters?.priceRange) {
            filtered = filtered.filter(
                p => p.salePrice >= filters.priceRange![0] && p.salePrice <= filters.priceRange![1]
            );
        }

        if (filters?.inStock) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        if (filters?.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(
                p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.salePrice - b.salePrice);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.salePrice - a.salePrice);
                break;
            case 'newest':
                filtered.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
                break;
            case 'popular':
            default:
                filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        setProducts(filtered);
        setLoading(false);
    }, [filters, sortBy]);

    return { products, loading };
};

export const useProduct = (productId: string) => {
    const [product, setProduct] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const p = inventoryService.getProduct(productId);
        setProduct(p);
        setLoading(false);
    }, [productId]);

    return { product, loading };
};
