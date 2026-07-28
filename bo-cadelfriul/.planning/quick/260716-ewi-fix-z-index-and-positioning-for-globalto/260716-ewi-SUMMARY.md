# Quick Task 260716-ewi Summary

**Status:** complete

## What was done

Fixed visibility of global UI components:

- **GlobalToast:** Updated wrapper to `z-[9999] pointer-events-none`, individual toasts to `pointer-events-auto`
- **GlobalConfirm:** Updated backdrop to `z-[9999] bg-black/50 backdrop-blur-sm` (was `z-50 bg-black/10`)
- **AdminLayout:** Moved `<app-global-toast>` and `<app-global-confirm>` outside the `overflow-hidden` wrapper, placed as direct children of the layout root

## Files modified
- `src/app/shared/components/global-toast/global-toast.component.ts`
- `src/app/shared/components/global-confirm/global-confirm.component.ts`
- `src/app/layout/admin-layout.component.ts`

## Verification
- `npx ng build` passes
- Toasts and confirm dialog now render above all content
