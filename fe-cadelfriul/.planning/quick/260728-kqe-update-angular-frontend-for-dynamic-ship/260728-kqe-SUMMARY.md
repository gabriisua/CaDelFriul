---
phase: quick
plan: kqe
subsystem: e-commerce
tags: [stock, shipping, cart, checkout, error-handling]
requires: []
provides: [stock-aware-cart, dynamic-shipping, granular-checkout-errors]
affects: [src/lib/api.ts, src/context/CartContext.tsx, src/app/(vetrina)/shop/page.tsx, src/app/(vetrina)/cart/page.tsx, src/app/(vetrina)/checkout/page.tsx]
tech-stack:
  added: []
  patterns: [shipping-cost-api, stock-quantity-cap, error-message-parsing]
key-files:
  created: []
  modified:
    - src/lib/api.ts
    - src/context/CartContext.tsx
    - src/app/(vetrina)/shop/page.tsx
    - src/app/(vetrina)/cart/page.tsx
    - src/app/(vetrina)/checkout/page.tsx
decisions:
  - "Cart shipping shows 'Calculated at checkout' since cart page has no address context"
  - "Shipping cost falls back to 0 (free) on API error to avoid blocking checkout"
  - "stockQuantity on CartItem is optional for localStorage backward compatibility"
metrics:
  duration: 307s
  completed: 2026-07-28
  tasks: 2
  files: 5
---

# Quick Task 260728-kqe: Dynamic Shipping, Stock Limits, Checkout Errors Summary

Stock-aware cart and shop with dynamic shipping cost calculation and granular checkout error messages.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add stockQuantity to API types, stock-aware CartContext, stock-aware Shop page | `108202c` | Product.stockQuantity, CartItem.stockQuantity cap, Shop button states |
| 2 | Dynamic shipping cost in Cart + Checkout with granular error handling | `46bf9fe` | calculateShippingCost API, cart/checkout dynamic shipping, error parsing |

## What Was Built

### Task 1: Stock-Aware API, Cart, and Shop

**src/lib/api.ts:**
- Added `stockQuantity: number` to `Product` interface
- Added `ShippingCostRequest`, `ShippingCostResponse` interfaces
- Added `calculateShippingCost()` function calling `POST /api/shipping/calculate`

**src/context/CartContext.tsx:**
- Added optional `stockQuantity` to `CartItem` interface (backward-compatible with localStorage)
- `addToCart` now caps quantity at `stockQuantity` when adding an existing product
- Added `getMaxQuantity(productId)` helper exposed via context

**src/app/(vetrina)/shop/page.tsx:**
- Passes `stockQuantity` to `addToCart` when adding products
- Shows "Only X left in stock" badge when stock ≤ 5
- Button shows "Out of Stock" (disabled) when `stockQuantity === 0`
- Button shows "Max in Cart" (disabled) when cart quantity reaches stock limit

### Task 2: Dynamic Shipping and Checkout Errors

**src/app/(vetrina)/cart/page.tsx:**
- Added `shippingLoading` state
- Shipping row now shows "Calculating..." briefly on item changes, then "Calculated at checkout"

**src/app/(vetrina)/checkout/page.tsx:**
- Added `shippingCost` and `shippingLoading` state
- `useEffect` fetches shipping cost from backend when `selectedAddressId` changes
- Shipping row shows: "Calculating..." / "Free" / "€X.XX" dynamically
- Total includes `cartTotal + shippingCost`
- Place Order button disabled during shipping calculation
- Catch block parses `AuthError.body.message` for stock/address/product keywords and shows specific toast messages

## Known Stubs

None — all features are fully wired to real data flows.

## Threat Flags

None — error message parsing only surfaces human-readable backend messages; no internal stack traces or IDs exposed (T-quick-02 mitigated).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- All 5 modified files exist and are non-empty
- Both commits confirmed in git log (`108202c`, `46bf9fe`)
- TypeScript compiles with zero errors (`npx tsc --noEmit` clean)
