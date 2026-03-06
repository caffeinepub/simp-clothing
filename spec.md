# JADE Clothing

## Current State
Full-stack clothing store with dark/moody aesthetic. Products have a flat `category` text field (e.g. "Tops", "Bottoms"). The shop shows all products in one grid. Admin panel manages products, reviews, orders, FAQ, hero, about, and payments via localStorage. No structured category/subcategory system exists.

## Requested Changes (Diff)

### Add
- A `CategorySection` component on the main site — shown between the Hero and the Products grid — presenting Men's and Women's as top-level groups, each with sub-category tabs (Tops, Bottoms, Outerwear, Accessories). Clicking a sub-category filters the products grid.
- A `categories` localStorage key storing the category tree (gender → subcategories array).
- A **Categories tab** in the admin panel where the admin can:
  - Add / rename / delete top-level gender groups (Men's, Women's)
  - Add / rename / delete sub-categories within each gender group
- Product's `category` field in the admin edit form is replaced with a two-level select: Gender + Sub-category (e.g. "Men's / Tops"), stored as `"Men's > Tops"` in the existing `category` field.
- The shop section header shows the active filter label and a product count for that filter.
- An "All" option resets the filter to show every product regardless of category.

### Modify
- `ProductsSection` in `App.tsx` — accepts an optional `activeCategory` prop (format: `"Men's > Tops"` or `null` for all) and filters `displayProducts` accordingly.
- `AdminPage.tsx` → `ProductsSection` — replace the free-text category input with a two-level dropdown (gender → subcategory) using the categories stored in localStorage.
- Admin sidebar nav items — add a "Categories" entry between Products and Reviews.

### Remove
- Nothing removed; free-text category input is replaced by the structured selector.

## Implementation Plan
1. Create `CategoriesSection.tsx` component: renders gender tabs (Men's / Women's / All), sub-category chips per gender, and emits the selected filter string upward.
2. Update `App.tsx`: pass filter state down to `ProductsSection`; insert `CategoriesSection` between Hero and Products.
3. Create `AdminCategoriesSection` in `AdminPage.tsx`: CRUD for the category tree stored in `jade_categories` localStorage key; default tree is `{ "Men's": ["Tops","Bottoms","Outerwear","Accessories"], "Women's": ["Tops","Bottoms","Outerwear","Accessories"] }`.
4. Update product add/edit form in `AdminPage.tsx` to use a two-level `<select>` (gender first, then subcategory), writing result as `"Men's > Tops"` into `form.category`.
5. Add "Categories" to admin sidebar nav.
6. Update product filter logic in `ProductsSection` to match products by checking if `product.category` starts with the selected filter or equals it.
