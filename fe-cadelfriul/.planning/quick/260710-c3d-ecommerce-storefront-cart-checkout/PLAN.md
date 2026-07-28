# Quick Task 260710-c3d: E-commerce Storefront, Cart & Checkout

## Objective
Connect isolated Next.js route groups into a cohesive user flow with auth, e-commerce storefront, shopping cart, and checkout.

## Requirements
- [x] R1: Dynamic shop/catalog page fetching products from API
- [x] R2: Cart context with localStorage persistence
- [x] R3: Cart page with quantity controls and order summary
- [x] R4: Checkout page with address selection and order placement
- [x] R5: Header shows cart badge with item count
- [x] R6: Auth-gated checkout (redirects unauthenticated users)
- [x] R7: Footer updated with Shop link

## Implementation
- `src/lib/api.ts`: Added `getImageUrl()`, `Product` interface, `OrderRequest`, `fetchProducts()`, `placeOrder()`
- `src/context/CartContext.tsx`: New cart context with `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `cartTotal`, `itemCount`, localStorage sync
- `src/app/layout.tsx`: Wrapped with `<CartProvider>` inside `<AuthProvider>`
- `src/app/(vetrina)/_components/Header.tsx`: Added `ShoppingBag` icon with badge, replaced `/products` nav link with `/shop`
- `src/app/(vetrina)/shop/page.tsx`: Dynamic product catalog fetching from API
- `src/app/(vetrina)/cart/page.tsx`: Cart items with +/- controls, remove, order summary
- `src/app/(vetrina)/checkout/page.tsx`: Auth-gated, address selection, order summary, place order
- `src/app/(vetrina)/_components/Footer.tsx`: Updated Quick Links to include Shop
