---
status: complete
date: 2026-08-31
quick_id: 260831-no3
---

# Summary: Refactor Angular toast notification system

## What was done

Refactored the `GlobalToastComponent` to fix three usability issues:

1. **Position**: Moved from top-right (`top-5 right-5`) to bottom-right (`bottom-6 right-6`) to avoid overlapping with the header.

2. **Solid background**: Replaced transparent `bg-brand-primary/10` with solid `bg-[#f8f4ef]` (brand-bg hex) for the success toast. Error and info toasts already used solid Tailwind colors.

3. **Drop shadow**: Added `shadow-[0_4px_12px_rgba(0,0,0,0.15)]` to individual toast divs for better visual separation from page content. Z-index was already `z-[9999]`.

## Files changed

- `src/app/shared/components/global-toast/global-toast.component.ts` — 3 class attribute changes (position, background, shadow)

## Verification

- Build passes: `npx ng build --configuration=production` ✓
