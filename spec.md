# JADE Admin Panel

## Current State
- Single-page clothing brand site (JADE) with hero, products grid, about section, reviews, footer
- Backend: Motoko with static product array (getAllProducts, getProductsByCategory)
- Frontend: React + Tailwind, dark/moody aesthetic
- Components: CartDrawer, ChatWidget, PaymentModal, ProfilePanel, ReviewsSection
- No admin functionality — all content is hardcoded in frontend

## Requested Changes (Diff)

### Add
- `/admin` route — separate admin panel page, accessible only with a hardcoded password
- Admin login screen with password field (password: `Purple!Monkey$Dishwasher#42`)
- Admin dashboard with sidebar navigation and these management sections:
  - **Products** — add, edit, delete products (name, category, price in ₹, image slot)
  - **Reviews** — add, edit, delete customer reviews (name, item, rating, quote, date)
  - **Orders** — view all orders, update order status (Pending / Shipped / Delivered / Cancelled)
  - **FAQ** — add, edit, delete FAQ rules (keywords, answer)
  - **Hero** — edit hero tagline, CTA button text, season label
  - **About** — edit about section heading and two body paragraphs (Ethos, The Work)
- All admin data stored in Motoko backend (persistent state)
- Admin session stored in localStorage (survives page refresh until logout)
- Logout button in admin sidebar

### Modify
- Motoko backend: expand from static array to mutable stable state for products, reviews, orders, FAQ rules, hero content, about content
- Frontend App.tsx: add routing so `/admin` renders AdminPage, root `/` renders existing site
- ReviewsSection: read reviews from backend instead of hardcoded REVIEWS array
- ChatWidget: read FAQ rules from backend instead of hardcoded FAQ_RULES
- Hero + About sections: read editable content from backend

### Remove
- Hardcoded REVIEWS array in ReviewsSection.tsx (replaced by backend)
- Hardcoded FAQ_RULES in ChatWidget.tsx (replaced by backend)
- Static product array in main.mo (replaced by mutable stable var)

## Implementation Plan
1. Regenerate Motoko backend with full mutable state: products, reviews, orders, faq, hero settings, about settings; admin write methods; read methods for frontend
2. Update backend.d.ts bindings to expose all new types and methods
3. Create AdminPage component at src/components/AdminPage.tsx with:
   - Password login screen
   - Sidebar with 6 sections
   - Products CRUD table
   - Reviews CRUD table
   - Orders table with status updates
   - FAQ CRUD list
   - Hero text editor
   - About text editor
4. Add simple hash-based routing in App.tsx: `#admin` -> AdminPage, default -> main site
5. Update ReviewsSection to fetch from backend
6. Update ChatWidget to fetch FAQ rules from backend
7. Update Hero and About to fetch editable content from backend with fallback to current hardcoded values
