# JADE Clothing Store

## Current State

Full-stack clothing brand site with:
- Homepage: hero, products grid, about section, reviews
- Cart drawer + 3-step checkout modal (address → payment → confirmation)
- Admin panel at `/#admin` with password protection
- Admin sections: Products, Reviews, Orders, FAQ, Hero, About
- Orders stored in `localStorage` key `jade_orders`
- PaymentModal handles checkout but does NOT save orders to localStorage — this is the root cause of orders not appearing in admin
- Address validation: format only (6-digit PIN, 10-digit phone)
- No PIN lookup against external API
- No UPI/bank details configuration in admin
- No Track Your Order page for customers

## Requested Changes (Diff)

### Add
- **PIN code live lookup**: When customer types a 6-digit PIN in the address step, call `https://api.postalpincode.in/pincode/{pin}` (free, no auth). On success auto-fill `city` and `state`. Show inline loading spinner while fetching. Show error if PIN not found.
- **Track Your Order page**: Accessible via `/#track` (hash route). Customer enters order number (e.g. `#JD-1234`) and sees current status. Status is read from `jade_orders` in localStorage. Statuses displayed with a visual progress timeline: Order Placed → Processing → Shipped → Out for Delivery → Delivered. Cancelled shows as cancelled state.
- **UPI/Bank account config in admin**: New "Payments" section in admin sidebar. Admin can enter: UPI ID, UPI QR image URL (optional), Bank Account Name, Account Number, IFSC Code. Saved to `jade_payment_settings` in localStorage.
- **Track Your Order link** in site nav and footer

### Modify
- **Fix order saving**: In `PaymentModal.tsx`, `handlePlaceOrder` must save a complete order object to `jade_orders` in localStorage before showing the success screen. The order must include: id, orderNo, customerName, phone, address (line1+line2), city, state, pincode, paymentMethod, items (stringified cart items), totalCents, status ("Pending"), createdAt (formatted date string).
- **Payment step UPI section**: When payment method is UPI, show the admin-configured UPI ID (from `jade_payment_settings`) and QR image (if set) so the customer knows where to pay. Fall back to generic placeholder if not configured.
- **Admin Orders section**: Add "Processing" and "Out for Delivery" to the ORDER_STATUSES array (currently only Pending, Shipped, Delivered, Cancelled). Full list: Pending → Processing → Shipped → Out for Delivery → Delivered → Cancelled.
- **App routing**: Add `#track` hash route handling alongside existing `#admin` route.

### Remove
- Nothing removed

## Implementation Plan

1. **Fix PaymentModal order saving** (`PaymentModal.tsx`):
   - Read `jade_payment_settings` for UPI display
   - In `handlePlaceOrder`, construct AdminOrder object from cart items + address + method and append to `jade_orders` in localStorage before transitioning to success step
   - Show admin-configured UPI ID and QR code on UPI payment step

2. **PIN lookup** (`PaymentModal.tsx`):
   - On PIN field blur (or when length hits 6), fetch `https://api.postalpincode.in/pincode/{pin}`
   - Parse response and auto-fill city + state fields
   - Show loading indicator on the PIN field while fetching
   - Show inline error if invalid PIN

3. **Admin Payments section** (`AdminPage.tsx`):
   - Add `"payments"` to Section type and NAV_ITEMS
   - Create `PaymentSettingsSection` component with fields: UPI ID, QR URL, Bank Name, Account Number, IFSC
   - Read/write from `jade_payment_settings` localStorage key

4. **Extended order statuses** (`AdminPage.tsx`):
   - Update ORDER_STATUSES to: `["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]`

5. **Track Your Order page** (`App.tsx` + new `TrackOrder.tsx`):
   - Add hash route `#track` in `useIsAdminRoute`-style hook
   - Create `TrackOrderPage` component: input for order number, lookup from `jade_orders`, display status timeline
   - Add "Track Order" link to Nav and Footer

6. **Nav/Footer** (`App.tsx`):
   - Add Track Order button/link in Nav and Footer that navigates to `/#track`
