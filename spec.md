# JADE Clothing

## Current State
The app is a full-stack dark streetwear store with: hero section, product grid (with category filters), product detail modals (multi-image, sizes, descriptions), cart drawer, checkout flow (address → payment → confirmation), order tracking page, FAQ chat widget, customer reviews, admin panel (products, categories, reviews, orders, FAQ, hero, about, payment settings).

**Critical problem:** All admin-editable data (products, reviews, orders, FAQ, hero settings, about settings, categories, payment settings) is stored in `localStorage`. This means edits made on one device/browser are invisible to all other devices and customers.

## Requested Changes (Diff)

### Add
- Backend Motoko canister with stable storage for all data entities:
  - Products (id, name, category, priceCents, images: [Text], description, availableSizes: [Text])
  - Reviews (id, reviewerName, itemName, rating, quote, date)
  - Orders (id, orderNo, customerName, address, city, state, pincode, phone, paymentMethod, items, totalCents, status, createdAt)
  - FAQ rules (id, keywords, answer)
  - HeroSettings (tagline, ctaText, seasonLabel)
  - AboutSettings (heading, ethosParagraph, workParagraph)
  - Categories as JSON blob (Text)
  - PaymentSettings (upiId, upiQrUrl, bankName, accountNumber, ifscCode)
- Backend query functions: getProducts, getReviews, getOrders, getFaq, getHeroSettings, getAboutSettings, getCategories, getPaymentSettings
- Backend update functions: setProducts, setReviews, addOrder, updateOrderStatus, setFaq, setHeroSettings, setAboutSettings, setCategories, setPaymentSettings
- New React hooks to call all backend queries and mutations
- Loading states in admin panel sections while data is being fetched/saved

### Modify
- AdminPage: Replace all localStorage reads/writes with backend calls (useQuery/useMutation hooks)
- ReviewsSection (customer-facing): Read reviews from backend instead of localStorage
- ProductsSection (customer-facing): Read products from backend instead of localStorage
- App.tsx hero/about settings: Read from backend instead of localStorage
- ChatWidget: Read FAQ rules from backend instead of localStorage
- PaymentModal: Read payment settings from backend; save new orders to backend
- TrackOrderPage: Read orders from backend instead of localStorage
- CategoriesSection: Read categories from backend instead of localStorage

### Remove
- All localStorage reads/writes for admin data (jade_products, jade_reviews, jade_orders, jade_faq, jade_hero, jade_about, jade_categories, jade_payment_settings)

## Implementation Plan
1. Generate new Motoko backend with stable vars for all 8 data entities and CRUD functions
2. Update backend.d.ts with all new types and function signatures
3. Create useBackendData hook file with query + mutation hooks for all entities
4. Rewrite AdminPage to use backend hooks instead of localStorage
5. Rewrite ProductsSection to use backend products query
6. Rewrite ReviewsSection to use backend reviews query
7. Rewrite App.tsx hero/about to use backend settings queries
8. Rewrite ChatWidget to use backend FAQ query
9. Rewrite PaymentModal to use backend payment settings + addOrder mutation
10. Rewrite TrackOrderPage to use backend orders query
11. Rewrite CategoriesSection to use backend categories query
