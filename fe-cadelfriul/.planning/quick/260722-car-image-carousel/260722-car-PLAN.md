# Quick Task 260722-car — Plan

**Date:** 2026-07-22

## Tasks

1. Fix ProductCard image binding:
   - Accept `imageIds` and prepend backend base URL with `getImageUrl`.
   - Render images with responsive sizes and fallback.

2. Refactor shop page to use ProductCard:
   - Replace inline Card markup with ProductCard.
   - Pass formatted price and image IDs.

3. Add image carousel to ProductCard and RoomCard:
   - Add `currentIndex` state and navigation arrows.
   - Show navigation only when multiple images exist.
   - Display dot indicators.

## Verification
- Run `npx tsc --noEmit`
