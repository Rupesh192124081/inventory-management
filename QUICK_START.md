# 🚀 Quick Start Guide - Vyapar Complete Demo

## 📍 Two Applications, Two Ports

### 1️⃣ Admin Dashboard (Inventory Management)
**URL:** `http://localhost:5173`

**How to Run:**
```bash
# In the main project directory
npm run dev
```

**Features:**
- ✅ Dashboard with analytics
- ✅ Inventory management (Add/Edit/Delete products)
- ✅ POS/Billing system
- ✅ Customer/Vendor management
- ✅ Invoice history
- ✅ GST reports
- ✅ AI assistant

---

### 2️⃣ Customer Storefront (E-commerce)
**URL:** `http://localhost:5174`

**How to Run:**
```bash
# In a separate terminal
cd storefront
npm run dev
```

**Features:**
- ✅ Home page with featured products
- ✅ Product catalog with filters
- ✅ Shopping cart
- ✅ Multi-step checkout
- ✅ Order confirmation

---

## 🔄 How They Work Together

1. **Admin adds products** → Saved to `localStorage`
2. **Storefront reads products** → Displays in catalog
3. **Customer places order** → Saved to `localStorage`
4. **Admin views orders** → In invoice history

---

## 🎯 Quick Demo Workflow

### Step 1: Start Both Applications

**Terminal 1 - Admin:**
```bash
npm run dev
```
Opens at `http://localhost:5173`

**Terminal 2 - Storefront:**
```bash
cd storefront
npm run dev
```
Opens at `http://localhost:5174`

### Step 2: Add Products (Admin)

1. Go to `http://localhost:5173`
2. Click **Inventory** tab
3. Click **Add Item**
4. Fill in product details:
   - Name, Price, Stock, Category
   - Mark as "Featured" or "New Arrival"
5. Save

### Step 3: Shop (Customer)

1. Go to `http://localhost:5174`
2. Browse products on home page
3. Click **All Products** to see catalog
4. Use filters (category, price)
5. Click **Add to Cart** on products
6. Click cart icon (top right)
7. Click **Proceed to Checkout**
8. Fill shipping info
9. Select payment method
10. Place order

### Step 4: View Orders (Admin)

1. Go back to admin (`http://localhost:5173`)
2. Click **Invoice History**
3. See customer orders
4. Process orders

---

## 📊 Demo Data Already Loaded

The storefront has **8 sample products**:
- Premium Wireless Headphones (₹2,999)
- Smart Watch Pro (₹4,999)
- Leather Laptop Bag (₹1,899)
- Wireless Mouse (₹699)
- Mechanical Keyboard RGB (₹3,999)
- Cotton T-Shirt Pack (₹999)
- Yoga Mat Premium (₹1,299)
- Desk Lamp LED (₹1,199)

---

## 🎨 Storefront Pages

| Page | URL | Status |
|------|-----|--------|
| Home | `/` | ✅ Working |
| Products | `/products` | ✅ Working |
| Cart | `/cart` | ✅ Working |
| Checkout | `/checkout` | ✅ Working |

---

## 🛠️ Troubleshooting

**Products not showing?**
- Demo data is already seeded in localStorage
- Refresh the page

**Can't access admin?**
- Make sure you're running `npm run dev` in the **main** directory
- Check port 5173 is not in use

**Storefront blank?**
- Make sure you're running from the **storefront** directory
- Check port 5174 is not in use

---

## 📝 Credits

**Built by:** Rupesh Reddy Baitapalli

**Tech Stack:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- LocalStorage (shared data)

---

## 🎉 You're All Set!

Open both URLs in separate browser tabs and start exploring! 🚀
