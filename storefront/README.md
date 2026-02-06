# Vyapar Store - E-commerce Storefront

A modern, responsive e-commerce storefront built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Beautiful Product Catalog**: Browse products with advanced filtering and sorting
- **Shopping Cart**: Add, update, and remove items with real-time updates
- **Multi-step Checkout**: Seamless checkout experience with shipping and payment options
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Real-time Inventory**: Syncs with admin inventory management system
- **Modern UI/UX**: Premium design with smooth animations and micro-interactions

## 📦 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **LocalStorage** - Data persistence (shared with admin)

## 🛠️ Installation

```bash
cd storefront
npm install
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

The storefront will be available at `http://localhost:5174`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
storefront/
├── pages/              # Main page components
│   ├── Home.tsx       # Landing page
│   ├── Products.tsx   # Product listing
│   ├── Cart.tsx       # Shopping cart
│   └── Checkout.tsx   # Checkout flow
├── components/
│   ├── layout/        # Header, Footer
│   ├── product/       # Product cards, grids
│   ├── cart/          # Cart components
│   └── common/        # Reusable components
├── hooks/             # Custom React hooks
│   ├── useCart.ts     # Cart management
│   └── useProducts.ts # Product fetching
├── services/          # Business logic
│   └── inventoryService.ts
├── types/             # TypeScript definitions
└── App.tsx            # Main app component
```

## 🔄 Data Synchronization

The storefront shares data with the admin inventory management system via LocalStorage:

- **Products**: Read from `vyapar_items`
- **Orders**: Written to `vyapar_orders`
- **Cart**: Stored per customer in `vyapar_cart_{customerId}`

## 🎨 Design Features

- **Gradient Hero Sections**: Eye-catching landing pages
- **Hover Effects**: Interactive product cards
- **Smooth Animations**: Fade-ins and transitions
- **Loading States**: Skeleton screens for better UX
- **Empty States**: Helpful messages when no data
- **Responsive Grid**: Adapts to all screen sizes

## 📱 Pages

### Home (`/`)
- Hero banner with CTA
- Featured products
- Category showcase
- New arrivals
- Customer testimonials
- Trust badges

### Products (`/products`)
- Product grid with filters
- Category filtering
- Price range slider
- Sort options (popular, price, newest)
- Stock availability filter

### Cart (`/cart`)
- Cart item list
- Quantity controls
- Remove items
- Order summary
- Shipping calculator

### Checkout (`/checkout`)
- Multi-step process
- Shipping information form
- Payment method selection
- Order review
- Order confirmation

## 🎯 Key Features

### Shopping Cart
- Add to cart from product cards
- Update quantities
- Remove items
- Real-time total calculation
- Persistent across sessions

### Checkout Flow
1. **Shipping**: Enter delivery address
2. **Payment**: Choose payment method (COD, UPI, Card)
3. **Review**: Confirm order details
4. **Confirmation**: Order success with order ID

### Product Features
- Product variants (size, color, etc.)
- Stock availability display
- Sale badges and discounts
- Wishlist functionality
- Quick add to cart
- Related products

## 🔧 Configuration

### Port Configuration
The storefront runs on port `5174` by default (different from admin dashboard on `5173`).

To change the port, edit `vite.config.ts`:
```typescript
server: {
  port: 5174, // Change this
}
```

## 🚀 Deployment

### Option 1: Same Domain
Deploy both admin and storefront to the same domain:
- Admin: `yourdomain.com/admin`
- Store: `yourdomain.com`

### Option 2: Subdomain
- Admin: `admin.yourdomain.com`
- Store: `shop.yourdomain.com`

### Option 3: Separate Domains
- Admin: `admin-yourdomain.com`
- Store: `yourdomain.com`

## 📊 Demo Data

To populate the store with demo products, run the admin dashboard first and add some products. The storefront will automatically display them.

## 🎨 Customization

### Colors
Edit the Tailwind config or use CSS variables in `index.html`:
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Accent: `#ec4899` (Pink)

### Fonts
Currently using **Plus Jakarta Sans**. Change in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

## 🐛 Troubleshooting

### Products not showing
- Make sure the admin dashboard has products added
- Check browser console for errors
- Verify LocalStorage has `vyapar_items` key

### Cart not persisting
- Check browser LocalStorage is enabled
- Clear cache and reload

### Styling issues
- Ensure Tailwind CDN is loading
- Check browser console for CSS errors

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

---

Built with ❤️ using React + TypeScript + Tailwind CSS
