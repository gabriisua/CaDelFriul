# Quick Task 260716-o9z: Add vatRate to Product

## Goal
Add `vatRate: number` field to Product model, edit dialog form, and products list grid.

## Files Modified
- `src/app/core/models/product.model.ts` — added `vatRate` to `Product` and `ProductRequest`
- `src/app/features/products/components/product-edit-dialog/product-edit-dialog.component.ts` — form control, patchValue, reset, submit
- `src/app/features/products/products.component.ts` — added "VAT %" column to data grid

## Verification
- `ng build` passes cleanly
