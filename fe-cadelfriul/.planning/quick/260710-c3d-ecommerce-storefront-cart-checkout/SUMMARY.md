# Summary: E-commerce Storefront, Cart & Checkout

## What was done
- Created dynamic `/shop` page fetching products from backend API
- Created `CartContext` with localStorage persistence for cart state
- Created `/cart` page with quantity controls and order summary
- Created `/checkout` page with address selection and order placement (auth-gated)
- Updated Header with cart badge and Shop nav link
- Updated Footer with Shop link in Quick Links
- Fixed CartContext lint warning (setState in effect) using lazy initializer pattern
- All routes compile and build passes

## Files changed
- `src/lib/api.ts` — added product types, order types, fetchProducts, placeOrder, getImageUrl
- `src/context/CartContext.tsx` — new cart context with localStorage sync
- `src/app/layout.tsx` — wrapped with CartProvider
- `src/app/(vetrina)/_components/Header.tsx` — cart badge, Shop nav link
- `src/app/(vetrina)/_components/Footer.tsx` — Shop link in Quick Links
- `src/app/(vetrina)/shop/page.tsx` — new dynamic product catalog page
- `src/app/(vetrina)/cart/page.tsx` — new cart page
- `src/app/(vetrina)/checkout/page.tsx` — new checkout page (auth-gated)

## Verification
- `npm run lint`: only pre-existing warnings remain
- `npm run build`: all 20 routes compile successfully, including new /shop, /cart, /checkout
