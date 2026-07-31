# Quick Task 260710-b4e: Fix next/image SSRF private IP error

## Objective
Fix Next.js SSRF protection error when rendering product images from local Spring Boot backend (`localhost:8080`).

## Root Cause
Next.js image optimization server blocks requests to private IPs. The `Product` interface also had a mismatch (`imageIds` vs `imageUrl`).

## Changes
- `next.config.ts`: Added `unoptimized: true` to `images` config — bypasses Next.js image optimization, letting browser fetch directly from backend
- `src/app/(vetrina)/shop/page.tsx`: Fixed `Product` type usage — changed `product.imageIds` references to `product.imageUrl` to match the actual `Product` interface

## Verification
- `npm run build` passes with all 20 routes
- All 3 Image components (shop, cart, checkout) now use unoptimized rendering
