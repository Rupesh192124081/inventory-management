import { useState, useEffect, useMemo } from 'react';
import { CartItem, Item, ItemVariant } from '../types/storefront';
import { inventoryService } from '../services/inventoryService';

export const useCart = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerId, setCustomerId] = useState<string>('guest');

    useEffect(() => {
        const customer = inventoryService.getCurrentCustomer();
        const id = customer?.id || 'guest';
        setCustomerId(id);
        setCart(inventoryService.getCart(id));
    }, []);

    const addToCart = (item: Item, variant: ItemVariant | null, quantity: number = 1) => {
        const newCart = [...cart];
        const existingIndex = newCart.findIndex(
            c => c.itemId === item.id && c.variantId === variant?.id
        );

        if (existingIndex >= 0) {
            newCart[existingIndex].quantity += quantity;
        } else {
            newCart.push({
                itemId: item.id,
                variantId: variant?.id,
                quantity,
                addedAt: new Date().toISOString(),
            });
        }

        setCart(newCart);
        inventoryService.saveCart(customerId, newCart);
    };

    const updateQuantity = (itemId: string, variantId: string | undefined, quantity: number) => {
        const newCart = cart.map(item =>
            item.itemId === itemId && item.variantId === variantId
                ? { ...item, quantity }
                : item
        );
        setCart(newCart);
        inventoryService.saveCart(customerId, newCart);
    };

    const removeItem = (itemId: string, variantId?: string) => {
        const newCart = cart.filter(
            item => !(item.itemId === itemId && item.variantId === variantId)
        );
        setCart(newCart);
        inventoryService.saveCart(customerId, newCart);
    };

    const clearCart = () => {
        setCart([]);
        inventoryService.saveCart(customerId, []);
    };

    const cartWithDetails = useMemo(() => {
        const products = inventoryService.getProducts();
        return cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.itemId);
            if (!product) return null;

            const variant = cartItem.variantId
                ? product.variants?.find(v => v.id === cartItem.variantId)
                : null;

            return {
                ...cartItem,
                product,
                variant,
                price: variant?.salePrice || product.salePrice,
                name: product.name + (variant ? ` - ${variant.name}` : ''),
                imageUrl: product.imageUrl,
            };
        }).filter(Boolean);
    }, [cart]);

    const total = useMemo(() => {
        return cartWithDetails.reduce((sum, item) => {
            return sum + (item!.price * item!.quantity);
        }, 0);
    }, [cartWithDetails]);

    const itemCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return {
        cart: cartWithDetails,
        rawCart: cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        itemCount,
    };
};
