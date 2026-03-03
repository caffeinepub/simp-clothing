# JADE Clothing

## Current State
- Full clothing brand site with hero, products grid, about, reviews, cart drawer, checkout modal (3-step), admin panel at /#admin
- AdminProduct type has a single optional `imageUrl: string` field
- Product cards show a single image in the grid with hover overlay; no product detail view for customers
- Admin panel Products section has one Image URL input field per product

## Requested Changes (Diff)

### Add
- `images: string[]` array field on AdminProduct (replaces single imageUrl)
- In admin Products panel: multi-image manager — view/add/remove individual image URLs per product (up to ~5), with each URL on a row with a remove button and an "Add Image" button to append another
- Product detail modal for customers: clicking a product card opens a modal showing the product name, price, category, all images in a swipeable/clickable gallery carousel, and an "Add to Cart" button

### Modify
- AdminProduct type: `imageUrl?: string` → `images: string[]`
- Migration: when reading from localStorage, if old `imageUrl` exists and no `images`, auto-migrate to `images: [imageUrl]`
- Admin product row: display first image in the thumbnail column
- ProductCard in App.tsx: clicking the card opens the product detail modal instead of only relying on the hover overlay for add-to-cart; hover overlay add-to-cart button remains
- `getImage()` helper in App.tsx: use first item of `images` array

### Remove
- Single `imageUrl` field from admin product form (replaced by multi-image manager)

## Implementation Plan
1. Update `AdminProduct` type: replace `imageUrl?: string` with `images: string[]`
2. Add localStorage migration helper in AdminPage that converts old `imageUrl` to `images` array on read
3. Update admin Products section: replace single image URL input with a dynamic list (each row: input + remove button + add row button)
4. Update App.tsx `getImage()` to read `images[0]` instead of `imageUrl`
5. Create `ProductDetailModal` component with image carousel (prev/next arrows, thumbnail dots), product info, and Add to Cart button
6. Wire ProductCard click to open ProductDetailModal with the selected product
7. Ensure PaymentModal order save still works (no structural change needed there)
