# Quick Task 260831-no3: Refactor the Angular toast notification system

## Task

Fix usability and styling issues with the Angular toast notification system:
1. Move toast position from top-right to bottom-right
2. Remove transparent backgrounds, apply solid brand color
3. Add drop shadow for better visual separation

## Implementation

Single file change: `src/app/shared/components/global-toast/global-toast.component.ts`

### Changes
- Container: `top-5` → `bottom-6` (24px from bottom)
- Success toast: `bg-brand-primary/10` → `bg-[#f8f4ef]` (solid brand-bg)
- Borders: `/30` opacity → solid `border-brand-primary` / `border-red-300` / `border-blue-300`
- Shadow: Added `shadow-[0_4px_12px_rgba(0,0,0,0.15)]` on individual toast divs
- Z-index: Already `z-[9999]` — no change needed

### Files
- `src/app/shared/components/global-toast/global-toast.component.ts`
