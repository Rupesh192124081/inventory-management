# Vyapar Complete Demo - Setup Guide

## 🎯 Overview

This is a complete **DEMO** inventory management and e-commerce system with two separate frontend applications:

1. **Admin Dashboard** (`/`) - Inventory management, billing, analytics
2. **Customer Storefront** (`/storefront`) - E-commerce website for customers

Both applications share data via LocalStorage, making it a fully functional demo without needing a backend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install admin dashboard dependencies
npm install

# Install storefront dependencies
cd storefront
npm install
cd ..
```

### 2. Run Both Applications

**Terminal 1 - Admin Dashboard:**
```bash
npm run dev
```
Opens at `http://localhost:5173`

**Terminal 2 - Customer Storefront:**
```bash
cd storefront
npm run dev
```
Opens at `http://localhost:5174`

### 3. Seed Demo Data

Open the **Admin Dashboard** (`http://localhost:5173`) in your browser and open the browser console, then run:

```javascript
// Seed demo products
const demoItems = [
  {
    id: 'item-1',
    name: 'Premium Wireless Headphones',
    hsnCode: '85183000',
    purchasePrice: 2000,
    salePrice: 2999,
    stock: 50,
    minStock: 10,
    unit: 'pcs',
    gstRate: 18,
    category: 'electronics',
    description: 'High-quality wireless headphones',
    featured: true,
    newArrival: false,
    onSale: true,
  },
  // Add more products...
];

localStorage.setItem('vyapar_items', JSON.stringify(demoItems));
location.reload();
```

Or manually add products using the admin dashboard's inventory management interface.

## 📁 Project Structure

```
inventory-management/
├── App.tsx                    # Admin dashboard main app
├── components/                # Admin components
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── Billing.tsx
│   ├── Parties.tsx
│   └── ...
├── index.html                 # Admin entry point
├── package.json               # Admin dependencies
│
└── storefront/                # Customer e-commerce site
    ├── App.tsx                # Storefront main app
    ├── pages/
    │   ├── Home.tsx
    │   ├── Products.tsx
    │   ├── Cart.tsx
    │   └── Checkout.tsx
    ├── components/
    │   ├── layout/
    │   ├── product/
    │   └── cart/
    ├── index.html             # Storefront entry point
    └── package.json           # Storefront dependencies
```

## 🔄 How Data Syncs

Both applications use **LocalStorage** as a shared data layer:

| Data Type | LocalStorage Key | Admin | Storefront |
|-----------|-----------------|-------|------------|
| Products | `vyapar_items` | ✅ Read/Write | ✅ Read Only |
| Orders | `vyapar_orders` | ✅ Read Only | ✅ Write |
| Customers | `vyapar_customers` | ✅ Read/Write | ✅ Read/Write |
| Cart | `vyapar_cart_{id}` | ❌ | ✅ Read/Write |

### Workflow Example:

1. **Admin** adds products via Inventory Management
2. Products are saved to `localStorage.vyapar_items`
3. **Storefront** reads products and displays them
4. **Customer** adds items to cart and places order
5. Order is saved to `localStorage.vyapar_orders`
6. **Admin** can view and process the order

## 🎨 Admin Dashboard Features

- ✅ Dashboard with KPIs and charts
- ✅ Inventory management (CRUD operations)
- ✅ Product variants support
- ✅ POS/Billing system
- ✅ Party (customer/vendor) management
- ✅ Invoice history
- ✅ GST compliance reports
- ✅ Analytics and reports
- ✅ AI assistant
- ✅ Settings management
- ✅ Dark mode ready
- ✅ Responsive design

## 🛒 Storefront Features

- ✅ Beautiful home page with hero section
- ✅ Product catalog with filters
- ✅ Category browsing
- ✅ Product search
- ✅ Shopping cart
- ✅ Multi-step checkout
- ✅ Order confirmation
- ✅ Responsive design
- ✅ Mobile-optimized
- ✅ Wishlist functionality
- ✅ Product reviews (UI ready)
- ✅ Related products

## 🎯 Demo Workflow

### As an Admin:

1. Open admin dashboard (`localhost:5173`)
2. Go to **Inventory** tab
3. Click **Add Item** and create products
4. Set prices, stock, categories
5. Mark some as "Featured" or "New Arrival"
6. Go to **Dashboard** to see analytics

### As a Customer:

1. Open storefront (`localhost:5174`)
2. Browse products on home page
3. Click on a product to see details
4. Add items to cart
5. Go to cart and review items
6. Proceed to checkout
7. Fill shipping information
8. Select payment method
9. Place order

### Back to Admin:

1. Check **Invoice History** to see customer orders
2. Process the order
3. Update order status
4. View analytics on dashboard

## 🔧 Customization

### Admin Dashboard

**Colors:** Edit `index.html` CSS variables
**Logo:** Update the "V" icon in `App.tsx`
**Business Info:** Modify `profile` state in `App.tsx`

### Storefront

**Colors:** Edit `storefront/index.html` CSS variables
**Logo:** Update Header component
**Categories:** Modify categories in `Home.tsx`
**Payment Methods:** Edit `Checkout.tsx`

## 📱 Mobile Support

Both applications are fully responsive:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Option 1: Separate Deployments
- Deploy admin to `admin.yourdomain.com`
- Deploy storefront to `shop.yourdomain.com`

### Option 2: Same Domain
- Admin: `yourdomain.com/admin`
- Store: `yourdomain.com`

### Option 3: Netlify/Vercel
Both can be deployed as static sites:

```bash
# Build admin
npm run build

# Build storefront
cd storefront
npm run build
```

## 🐛 Troubleshooting

**Products not showing in storefront:**
- Add products in admin dashboard first
- Check browser console for errors
- Verify LocalStorage has `vyapar_items`

**Orders not appearing in admin:**
- Place an order in storefront first
- Check LocalStorage has `vyapar_orders`
- Refresh admin dashboard

**Styling issues:**
- Clear browser cache
- Check Tailwind CDN is loading
- Verify no console errors

## 📊 Sample Data

The demo includes 10 sample products across categories:
- Electronics (5 items)
- Fashion (2 items)
- Sports (2 items)
- Home & Living (1 item)
- Books (1 item)

## 🎓 Learning Resources

This demo showcases:
- React 19 with TypeScript
- State management with hooks
- LocalStorage as a database
- Responsive design with Tailwind
- Client-side routing
- Form handling
- Shopping cart logic
- Multi-step forms

## 📝 Notes

- This is a **DEMO** project for learning purposes
- No real backend or database
- Data persists in browser LocalStorage
- Clearing browser data will reset everything
- Not production-ready (needs proper backend)

## 🤝 Next Steps

To make this production-ready:
1. Add a real backend (Node.js, Python, etc.)
2. Use a database (PostgreSQL, MongoDB)
3. Implement authentication
4. Add payment gateway integration
5. Set up email notifications
6. Add image upload functionality
7. Implement search with Elasticsearch
8. Add analytics tracking

---

**Enjoy exploring the demo! 🎉**
