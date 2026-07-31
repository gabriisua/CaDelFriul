# Summary: Fix next/image SSRF private IP error

## What was done
- Added `unoptimized: true` to `next.config.ts` images config to bypass Next.js SSRF protection for localhost:8080 backend images
- Fixed `Product` type mismatch in shop page: changed `product.imageIds` → `product.imageUrl` to match the actual `Product` interface definition

## Files changed
- `next.config.ts` — added `unoptimized: true`
- `src/app/(vetrina)/shop/page.tsx` — fixed `imageIds` → `imageUrl` references

## Verification
- `npm run build`: all 20 routes compile successfully
- TypeScript type check passes
