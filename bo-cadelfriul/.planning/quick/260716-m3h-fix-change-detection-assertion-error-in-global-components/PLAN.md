# PLAN: Fix Change Detection Assertion Error in Global Components

**ID:** 260716-m3h  
**Date:** 2026-07-16  
**Status:** DONE

## Problem
GlobalToastComponent and GlobalConfirmComponent throw "ASSERTION ERROR: Should be run in update mode" when calling `detectChanges()` synchronously inside RxJS subscriptions.

## Solution
Replace `detectChanges()` with `markForCheck()` and add `ChangeDetectionStrategy.OnPush` to both components.

## Changes Made

### 1. GlobalToastComponent (`src/app/shared/components/global-toast/global-toast.component.ts`)
- Added `ChangeDetectionStrategy.OnPush`
- Replaced `this.cdr.detectChanges()` with `this.cdr.markForCheck()`

### 2. GlobalConfirmComponent (`src/app/shared/components/global-confirm/global-confirm.component.ts`)
- Added `ChangeDetectionStrategy.OnPush`
- Replaced `this.cdr.detectChanges()` with `this.cdr.markForCheck()`

## Why This Works
- `markForCheck()` marks the component as dirty for the next Angular change detection cycle
- `OnPush` strategy prevents unnecessary change detection runs
- Avoids calling `detectChanges()` outside Angular's update phase

## Verification
- Build passed with no errors
- No more assertion errors in console
