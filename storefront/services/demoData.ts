import { Item } from '../types/storefront';

export const demoProducts: Item[] = [
    // Electronics
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        hsnCode: '85183000',
        description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
        purchasePrice: 7800,
        salePrice: 12999,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        category: 'Electronics',
        stock: 45,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['wireless', 'audio', 'premium'],
        featured: true,
        onSale: true,
        salePercentage: 19
    },
    {
        id: '2',
        name: 'Smart Watch Pro',
        hsnCode: '91021100',
        description: 'Advanced fitness tracking, heart rate monitoring, GPS, and 7-day battery life. Water resistant up to 50m.',
        purchasePrice: 15000,
        salePrice: 24999,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        category: 'Electronics',
        stock: 32,
        minStock: 5,
        unit: 'pcs',
        gstRate: 18,
        tags: ['smartwatch', 'fitness', 'tech'],
        featured: true,
        onSale: true,
        salePercentage: 17
    },
    {
        id: '3',
        name: 'Mechanical Gaming Keyboard',
        hsnCode: '84716060',
        description: 'RGB backlit mechanical keyboard with customizable keys, anti-ghosting, and premium build quality.',
        purchasePrice: 5400,
        salePrice: 8999,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
        category: 'Electronics',
        stock: 28,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['gaming', 'keyboard', 'rgb'],
        featured: false,
        onSale: true,
        salePercentage: 25
    },
    {
        id: '4',
        name: '4K Webcam',
        hsnCode: '85258020',
        description: 'Professional 4K webcam with auto-focus, built-in microphone, and excellent low-light performance.',
        purchasePrice: 4200,
        salePrice: 6999,
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
        category: 'Electronics',
        stock: 18,
        minStock: 5,
        unit: 'pcs',
        gstRate: 18,
        tags: ['webcam', 'streaming', '4k'],
        featured: false,
        onSale: true,
        salePercentage: 22
    },
    {
        id: '5',
        name: 'Portable SSD 1TB',
        hsnCode: '84717050',
        description: 'Ultra-fast portable SSD with 1TB storage, USB-C connectivity, and rugged design.',
        purchasePrice: 6000,
        salePrice: 9999,
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
        category: 'Electronics',
        stock: 52,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['storage', 'ssd', 'portable'],
        featured: true,
        onSale: false
    },

    // Fashion
    {
        id: '6',
        name: 'Premium Leather Jacket',
        hsnCode: '42031000',
        description: 'Genuine leather jacket with classic design, perfect fit, and timeless style.',
        purchasePrice: 9000,
        salePrice: 14999,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        category: 'Fashion',
        stock: 15,
        minStock: 5,
        unit: 'pcs',
        gstRate: 12,
        tags: ['leather', 'jacket', 'premium'],
        featured: true,
        onSale: true,
        salePercentage: 25
    },
    {
        id: '7',
        name: 'Designer Sunglasses',
        hsnCode: '90041010',
        description: 'Polarized designer sunglasses with UV protection and premium frame quality.',
        purchasePrice: 2400,
        salePrice: 3999,
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
        category: 'Fashion',
        stock: 42,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['sunglasses', 'designer', 'accessories'],
        featured: false,
        onSale: true,
        salePercentage: 33
    },
    {
        id: '8',
        name: 'Classic Sneakers',
        hsnCode: '64039990',
        description: 'Comfortable and stylish sneakers perfect for everyday wear. Premium materials and cushioned sole.',
        purchasePrice: 3600,
        salePrice: 5999,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
        category: 'Fashion',
        stock: 67,
        minStock: 15,
        unit: 'pcs',
        gstRate: 12,
        tags: ['shoes', 'sneakers', 'casual'],
        featured: true,
        onSale: true,
        salePercentage: 25
    },
    {
        id: '9',
        name: 'Luxury Watch',
        hsnCode: '91021900',
        description: 'Elegant luxury watch with automatic movement, sapphire crystal, and leather strap.',
        purchasePrice: 21000,
        salePrice: 34999,
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop',
        category: 'Fashion',
        stock: 8,
        minStock: 3,
        unit: 'pcs',
        gstRate: 18,
        tags: ['watch', 'luxury', 'accessories'],
        featured: true,
        onSale: true,
        salePercentage: 22
    },
    {
        id: '10',
        name: 'Canvas Backpack',
        hsnCode: '42021290',
        description: 'Durable canvas backpack with multiple compartments, laptop sleeve, and comfortable straps.',
        purchasePrice: 1800,
        salePrice: 2999,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        category: 'Fashion',
        stock: 38,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['backpack', 'canvas', 'travel'],
        featured: false,
        onSale: true,
        salePercentage: 25
    },

    // Home & Living
    {
        id: '11',
        name: 'Smart LED Bulb Set',
        hsnCode: '85395000',
        description: 'WiFi-enabled smart LED bulbs with color changing, voice control, and energy efficiency.',
        purchasePrice: 1200,
        salePrice: 1999,
        imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500&h=500&fit=crop',
        category: 'Home',
        stock: 95,
        minStock: 20,
        unit: 'set',
        gstRate: 18,
        tags: ['smart', 'lighting', 'home'],
        featured: false,
        onSale: true,
        salePercentage: 33
    },
    {
        id: '12',
        name: 'Aromatherapy Diffuser',
        hsnCode: '84195000',
        description: 'Ultrasonic aromatherapy diffuser with LED lights, auto shut-off, and whisper-quiet operation.',
        purchasePrice: 1500,
        salePrice: 2499,
        imageUrl: 'https://images.unsplash.com/photo-1602874801006-96e3e93ee722?w=500&h=500&fit=crop',
        category: 'Home',
        stock: 56,
        minStock: 10,
        unit: 'pcs',
        gstRate: 18,
        tags: ['aromatherapy', 'wellness', 'home'],
        featured: true,
        onSale: true,
        salePercentage: 29
    },
];

// Function to seed demo data into localStorage
export const seedDemoData = () => {
    // Save products to both keys for compatibility
    localStorage.setItem('vyapar_items', JSON.stringify(demoProducts));
    localStorage.setItem('storefront_products', JSON.stringify(demoProducts));

    // Initialize other data if not exists
    if (!localStorage.getItem('vyapar_parties')) {
        const demoParties = [
            {
                id: '1',
                name: 'Retail Customer',
                type: 'customer',
                phone: '+91 98765 43210',
                email: 'customer@example.com',
                gstin: '',
                balance: 0,
                loyaltyPoints: 150
            },
            {
                id: '2',
                name: 'Electronics Supplier',
                type: 'supplier',
                phone: '+91 98765 43211',
                email: 'supplier@electronics.com',
                gstin: '27AAAAA0000A1Z5',
                balance: 25000,
                loyaltyPoints: 0
            }
        ];
        localStorage.setItem('vyapar_parties', JSON.stringify(demoParties));
    }

    if (!localStorage.getItem('vyapar_invoices')) {
        localStorage.setItem('vyapar_invoices', JSON.stringify([]));
    }

    if (!localStorage.getItem('vyapar_expenses')) {
        localStorage.setItem('vyapar_expenses', JSON.stringify([]));
    }

    if (!localStorage.getItem('vyapar_profile')) {
        const profile = {
            name: 'Vyapar Pro Retail',
            tagline: 'Premium Business Suite',
            address: '123 Business Hub, Silicon Valley, India',
            phone: '+91 98765 43210',
            gstin: '27AAAAA0000A1Z5',
            currency: '₹'
        };
        localStorage.setItem('vyapar_profile', JSON.stringify(profile));
    }

    console.log('✅ Demo data seeded successfully!');
    console.log(`📦 ${demoProducts.length} products added to inventory`);
};
