# Quick Task 260716-er2 Summary

**Status:** complete

## What was done

Implemented a centralized global UI feedback system:

- **UiService:** Singleton service with BehaviorSubject-based state for toasts and global confirm dialog. Methods: `showToast()`, `showSuccess()`, `showError()`, `showInfo()`, `confirm()` (returns Promise<boolean>).
- **GlobalToastComponent:** Fixed-position toast container with slide-in animations. Subscribes to `UiService.toasts$`.
- **GlobalConfirmComponent:** Modal dialog subscribing to `UiService.confirm$`. Resolves promise on confirm/cancel.
- **AdminLayout:** Injected `<app-global-toast>` and `<app-global-confirm>` at root level.
- **StaffComponent:** Removed local `ConfirmDialogComponent`, `showConfirmDialog`, `staffToDelete`. Delete now uses `await this.ui.confirm()`. Success/error feedback via `ui.showSuccess()`/`ui.showError()`.
- **CustomersComponent:** Same cleanup — removed local confirm dialog and state, using `ui.confirm()` and toast feedback.

## Files modified
- `src/app/core/services/ui.service.ts` (new)
- `src/app/shared/components/global-toast/global-toast.component.ts` (new)
- `src/app/shared/components/global-confirm/global-confirm.component.ts` (new)
- `src/app/layout/admin-layout.component.ts`
- `src/app/features/staff/staff.component.ts`
- `src/app/features/customers/customers.component.ts`

## Verification
- `npx ng build` passes successfully
- Components reduced in size (staff: 8.16kB, customers: 3.67kB)
- Confirm dialogs and toasts now globally available
