# Quick Task 260716-ewi: Fix z-index and positioning for global components

## Goal
Fix GlobalToastComponent and GlobalConfirmComponent visibility by updating z-index, pointer-events, and layout placement.

## Tasks

### Task 1: Fix toast z-index and pointer-events
- **File:** `src/app/shared/components/global-toast/global-toast.component.ts`
- **Action:** Update wrapper to `z-[9999] pointer-events-none`, toasts to `pointer-events-auto`
- **Verify:** Build passes

### Task 2: Fix confirm z-index and backdrop
- **File:** `src/app/shared/components/global-confirm/global-confirm.component.ts`
- **Action:** Update backdrop to `z-[9999] bg-black/50 backdrop-blur-sm`
- **Verify:** Build passes

### Task 3: Fix layout placement
- **File:** `src/app/layout/admin-layout.component.ts`
- **Action:** Move `<app-global-toast>` and `<app-global-confirm>` outside overflow-hidden wrapper
- **Verify:** Build passes
