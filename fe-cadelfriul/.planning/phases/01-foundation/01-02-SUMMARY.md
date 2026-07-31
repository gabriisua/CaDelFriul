# 01-02 SUMMARY: shadcn Dependencies (Completed)

## What was done
- Installed 5 shadcn components via CLI:
  - `src/components/ui/card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - `src/components/ui/input.tsx` — Input
  - `src/components/ui/label.tsx` — Label
  - `src/components/ui/skeleton.tsx` — Skeleton
  - `src/components/ui/separator.tsx` — Separator
- All components use `@/lib/utils` for `cn()` imports (base-nova preset)
- All compile successfully on `build`

## Verification
- All 5 files exist in `src/components/ui/`
- `build` succeeds with no errors
