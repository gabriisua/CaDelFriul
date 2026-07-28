---
phase: 260715-fpt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/styles.css
  - src/app/layout/admin-layout.component.ts
  - src/app/shared/components/data-grid/data-grid.component.ts
  - src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
  - src/app/shared/components/logs-dialog/logs-dialog.component.ts
  - src/app/features/products/products.component.ts
  - src/app/features/products/categories.component.ts
  - src/app/features/staff/staff.component.ts
  - src/app/features/customers/customers.component.ts
  - src/app/features/orders/orders.component.ts
  - src/app/features/dashboard/dashboard.component.ts
  - src/app/features/auth/auth.component.ts
  - src/app/features/products/components/product-edit-dialog/product-edit-dialog.component.ts
  - src/app/features/products/components/category-edit-dialog/category-edit-dialog.component.ts
  - src/app/features/staff/components/staff-edit-dialog/staff-edit-dialog.component.ts
  - src/app/features/customers/components/customer-edit-dialog/customer-edit-dialog.component.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Backoffice sidebar uses warm brown/cream palette instead of dark gray"
    - "All primary action buttons (Add, Save, Login) use gold #c59860 with dark text"
    - "Dialogs use light overlay bg-black/10 backdrop-blur-xs instead of bg-black/50"
    - "Dialogs use rounded-xl instead of rounded-lg"
    - "Delete buttons use destructive variant (10% red bg, red text) instead of solid red"
    - "Page titles use Playfair Display serif font"
    - "Focus rings use gray #aaaaaa instead of blue"
    - "Body background is warm cream #f8f4ef"
  artifacts:
    - path: "src/styles.css"
      provides: "CSS custom properties and Tailwind v4 theme extension with brand tokens"
      contains: "@theme inline"
    - path: "src/app/layout/admin-layout.component.ts"
      provides: "Sidebar with warm color scheme and gold accent active links"
    - path: "src/app/shared/components/data-grid/data-grid.component.ts"
      provides: "Table with brand-colored action buttons and warm headers"
    - path: "src/app/shared/components/confirm-dialog/confirm-dialog.component.ts"
      provides: "Dialog with lighter overlay and destructive variant delete button"
    - path: "src/app/shared/components/logs-dialog/logs-dialog.component.ts"
      provides: "Dialog with lighter overlay and warm tones"
  key_links:
    - from: "src/styles.css"
      to: "all component templates"
      via: "Tailwind utility classes resolve to brand tokens"
      pattern: "brand-primary|brand-bg|brand-text|font-heading"
---

<objective>
Align the Angular backoffice UI/UX to match the Next.js storefront brand identity. Extract design tokens (colors, fonts, border-radius, button styles, dialog styles) and apply them across all 16 component files using Tailwind v4's CSS-first `@theme inline {}` config and direct utility class replacements. Zero TypeScript logic changes — pure template/CSS transformation.

Purpose: Visual brand consistency between storefront and backoffice. The backoffice currently uses generic Tailwind gray/blue palette; the storefront uses warm brown/cream/gold tones.

Output: 16 updated files with brand-aligned styling, 1 updated styles.css with design token definitions.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260715-fpt-align-angular-backoffice-ui-ux-brand-ide/260715-fpt-CONTEXT.md

## Current Codebase State

**Tailwind v4.1.12** — CSS-first config mode. `src/styles.css` is just `@import 'tailwindcss';` with zero customization. No `tailwind.config.js` exists. All theme customization goes into `src/styles.css` using `@theme inline {}` and CSS custom properties.

**Component structure:** All 16 components use Angular inline templates (no separate `.html` files). TypeScript logic is UNTOUCHED in this plan — only template class strings change.

**Current patterns found across all components:**
- Primary buttons: `bg-blue-600 hover:bg-blue-700 text-white` → must become `bg-brand-primary hover:opacity-80 text-brand-text`
- Delete buttons: `bg-red-600 hover:bg-red-700 text-white` → must become `bg-brand-destructive/10 hover:bg-brand-destructive/20 text-brand-destructive`
- Cancel buttons: `bg-gray-100 hover:bg-gray-200 text-gray-700` → must become `bg-brand-secondary hover:opacity-80 text-brand-text`
- Focus rings: `focus:ring-blue-500` → must become `focus:ring-brand-ring`
- Page titles: `text-gray-900 font-bold` → must become `text-brand-text font-bold font-heading` (Playfair Display)
- Dialog overlays: `bg-black/50` → must become `bg-black/10 backdrop-blur-xs`
- Dialog cards: `rounded-lg` → must become `rounded-xl`
- Sidebar: `bg-gray-900 text-white` → warm brown/cream palette with gold accent active links
- Spinner borders: `border-blue-600` → must become `border-brand-primary`

**Files with the exact replacement patterns (count of occurrences):**
- `bg-blue-600`: products.component.ts, categories.component.ts, staff.component.ts, orders.component.ts (spinner), dashboard.component.ts (stat cards), auth.component.ts (login btn), all 4 edit dialogs (save btns), data-grid.component.ts (action btns) = ~15 occurrences
- `bg-red-600`: confirm-dialog.component.ts (delete btn), admin-layout.component.ts (logout btns) = 3 occurrences
- `focus:ring-blue-500`: auth.component.ts (2 inputs), all 4 edit dialogs (~8 inputs) = ~10 occurrences
- `bg-black/50`: confirm-dialog, logs-dialog, all 4 edit dialogs, product-edit-dialog = 6 occurrences
- `text-gray-900`: sidebar, all page titles (8 occurrences), dialog titles = ~15 occurrences
- `rounded-lg` on dialogs: confirm-dialog, logs-dialog, all 4 edit dialogs = 6 occurrences
- `bg-gray-900` sidebar: admin-layout.component.ts = 1 occurrence

## Design Token Reference (from Next.js Storefront)

Colors: brand-bg #f8f4ef, brand-primary #c59860, brand-text #37302a, brand-secondary #ded7cf, brand-muted #808080, brand-border #ebebeb, brand-destructive #c4382d, brand-ring #aaaaaa
Fonts: Geist (sans), Playfair Display (heading, weight 600 only)
Border radius: base 0.625rem, buttons rounded-lg (10px), cards/dialogs rounded-xl (14px)
Button styles: default bg gold #c59860 text dark brown #37302a hover 80% opacity; destructive 10% red bg red text; cancel bg-secondary #ded7cf
Dialog overlay: bg-black/10 backdrop-blur-xs
</context>

<tasks>

<task type="auto">
  <name>Task 1: Define Brand Design Tokens in Global Styles</name>
  <files>src/styles.css, src/index.html</files>
  <action>
**src/styles.css** — Replace the entire file content with:

1. Import Google Fonts CDN at the top:
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap');
```

2. Define CSS custom properties in `:root`:
```css
:root {
  --color-brand-bg: #f8f4ef;
  --color-brand-primary: #c59860;
  --color-brand-text: #37302a;
  --color-brand-secondary: #ded7cf;
  --color-brand-muted: #808080;
  --color-brand-border: #ebebeb;
  --color-brand-destructive: #c4382d;
  --color-brand-ring: #aaaaaa;
}
```

3. Add Tailwind v4 theme extension using `@theme inline {}`:
```css
@import 'tailwindcss';

@theme inline {
  --color-brand-bg: var(--color-brand-bg);
  --color-brand-primary: var(--color-brand-primary);
  --color-brand-text: var(--color-brand-text);
  --color-brand-secondary: var(--color-brand-secondary);
  --color-brand-muted: var(--color-brand-muted);
  --color-brand-border: var(--color-brand-border);
  --color-brand-destructive: var(--color-brand-destructive);
  --color-brand-ring: var(--color-brand-ring);
  --font-heading: 'Playfair Display', serif;
}
```

4. Add global body styles:
```css
body {
  background-color: var(--color-brand-bg);
  color: var(--color-brand-text);
}
```

IMPORTANT: The `@import 'tailwindcss';` MUST come BEFORE the `@theme inline {}` block. The `:root` variables and `@theme inline` variables must have the SAME names for Tailwind v4 to resolve utility classes like `bg-brand-primary`, `text-brand-text`, etc.

**src/index.html** — Add Geist font import in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
```
Then add `style="font-family: 'Geist', sans-serif"` to the `<html>` tag.

Also add to `<head>`:
```html
<style>body { font-family: 'Geist', sans-serif; }</style>
```

**DO NOT** create a tailwind.config.js file — this project uses Tailwind v4 CSS-first mode.
  </action>
  <verify>
    <automated>grep -c "@theme inline" src/styles.css && grep -c "brand-primary" src/styles.css && grep -c "font-heading" src/styles.css</automated>
  </verify>
  <done>
    src/styles.css contains: @import 'tailwindcss' first, then @theme inline block with all 8 brand color tokens + font-heading, :root CSS custom properties, body background/color styles. src/index.html loads Geist font. No tailwind.config.js created.
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor Layout Sidebar and Shared Components (4 files)</name>
  <files>
    src/app/layout/admin-layout.component.ts,
    src/app/shared/components/data-grid/data-grid.component.ts,
    src/app/shared/components/confirm-dialog/confirm-dialog.component.ts,
    src/app/shared/components/logs-dialog/logs-dialog.component.ts
  </files>
  <action>
Apply brand tokens to layout and shared components. **ZERO TypeScript logic changes** — only template class string replacements.

### admin-layout.component.ts — Sidebar rebrand:
Replace the entire sidebar `<aside>` section:
- Outer div: `bg-gray-100` → `bg-brand-bg` (page bg)
- Sidebar aside: `bg-gray-900 text-white` → `bg-brand-secondary text-brand-text` (warm light gray)
- Sidebar header border: `border-b border-gray-700` → `border-b border-brand-border`
- Sidebar h1: keep `text-xl font-bold`, add `font-heading` class, remove `text-white` (use inherited brand-text)
- Sidebar subtitle: `text-gray-400` → `text-brand-muted`
- Nav link base: remove `hover:bg-gray-700`, add `text-brand-text/70 hover:text-brand-text hover:bg-brand-bg/50`
- Nav link active: `routerLinkActive="bg-gray-700"` → `routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"` and add `border-l-2 border-transparent` to the base class
- Sidebar footer border: `border-t border-gray-700` → `border-t border-brand-border`
- Logout button (sidebar): `bg-red-600 rounded hover:bg-red-700` → `bg-brand-destructive/10 text-brand-destructive rounded-lg hover:bg-brand-destructive/20`
- Header: `bg-white shadow-sm` → `bg-brand-bg shadow-sm`
- Header h2: `text-gray-800` → `text-brand-text`
- Header admin text: `text-gray-600` → `text-brand-muted`
- Header logout: `text-red-600 hover:text-red-800` → `text-brand-destructive hover:opacity-80`

### data-grid.component.ts — Table brand alignment:
- Table wrapper: `bg-white rounded-lg` → `bg-white/80 rounded-xl` (softer, rounder)
- Table header row: `bg-gray-50` → `bg-brand-secondary/30`
- Table header th: `text-gray-500 uppercase` → `text-brand-muted uppercase font-heading` (serif headers)
- Table body row hover: `hover:bg-gray-50` → `hover:bg-brand-bg/50`
- Table cell text: `text-gray-900` → `text-brand-text`
- Table dividers: `divide-gray-200` → `divide-brand-border`
- Action buttons: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500` → `bg-brand-primary hover:opacity-80 text-brand-text font-medium focus:ring-brand-ring`
- Image placeholder bg: `bg-gray-200` → `bg-brand-secondary`
- Image placeholder text: `text-gray-400` → `text-brand-muted`
- **Keep getStatusClass() switch/case colors AS-IS** — status badges remain standard Tailwind colors (yellow, blue, indigo, purple, green, red)

### confirm-dialog.component.ts — Dialog brand alignment:
- Overlay: `bg-black/50` → `bg-black/10 backdrop-blur-xs`
- Dialog card: `bg-white rounded-lg` → `bg-white rounded-xl`
- Dialog title: `text-gray-900` → `text-brand-text font-heading` (Playfair Display)
- Dialog message: `text-gray-600` → `text-brand-muted`
- Cancel button: `bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg` → `bg-brand-secondary hover:opacity-80 text-brand-text rounded-lg`
- Delete button: `bg-red-600 hover:bg-red-700 text-white rounded-lg` → `bg-brand-destructive/10 hover:bg-brand-destructive/20 text-brand-destructive rounded-lg`

### logs-dialog.component.ts — Dialog brand alignment:
- Overlay: `bg-black/50` → `bg-black/10 backdrop-blur-xs`
- Dialog card: `bg-white rounded-lg` → `bg-white rounded-xl`
- Dialog title: `text-gray-900` → `text-brand-text font-heading`
- Close button: `text-gray-400 hover:text-gray-600` → `text-brand-muted hover:text-brand-text`
- Table header: `bg-gray-50 text-gray-500` → `bg-brand-secondary/30 text-brand-muted`
- Table cell text: `text-gray-900` → `text-brand-text`, `text-gray-700` → `text-brand-text`, `text-gray-500` → `text-brand-muted`
- Table dividers: `divide-gray-200` → `divide-brand-border`
- Close button (bottom): `bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg` → `bg-brand-secondary hover:opacity-80 text-brand-text rounded-lg`
- Empty state text: `text-gray-500` → `text-brand-muted`
  </action>
  <verify>
    <automated>grep -c "brand-primary\|brand-bg\|brand-text\|brand-secondary\|brand-destructive\|brand-ring\|brand-muted\|brand-border" src/app/layout/admin-layout.component.ts src/app/shared/components/data-grid/data-grid.component.ts src/app/shared/components/confirm-dialog/confirm-dialog.component.ts src/app/shared/components/logs-dialog/logs-dialog.component.ts | grep -v ":0$"</automated>
  </verify>
  <done>
    All 4 files use brand token utility classes. Sidebar has warm brown/cream palette with gold accent active links. DataGrid has brand-colored action buttons with serif headers. Both dialogs have lighter overlay (bg-black/10 backdrop-blur-xs), rounded-xl cards, and brand-colored buttons. Confirm dialog delete button uses destructive variant. No TypeScript logic changed.
  </done>
</task>

<task type="auto">
  <name>Task 3: Update All Feature and Edit Dialog Components (12 files)</name>
  <files>
    src/app/features/products/products.component.ts,
    src/app/features/products/categories.component.ts,
    src/app/features/staff/staff.component.ts,
    src/app/features/customers/customers.component.ts,
    src/app/features/orders/orders.component.ts,
    src/app/features/dashboard/dashboard.component.ts,
    src/app/features/auth/auth.component.ts,
    src/app/features/products/components/product-edit-dialog/product-edit-dialog.component.ts,
    src/app/features/products/components/category-edit-dialog/category-edit-dialog.component.ts,
    src/app/features/staff/components/staff-edit-dialog/staff-edit-dialog.component.ts,
    src/app/features/customers/components/customer-edit-dialog/customer-edit-dialog.component.ts
  </files>
  <action>
Apply brand tokens to all remaining feature and edit dialog components. **ZERO TypeScript logic changes** — only template class string replacements. These are mechanical find-replace patterns across 12 files.

### Mechanical Replacement Patterns (apply to ALL 12 files):

**Primary action buttons (Add, Save, Login):**
- `bg-blue-600 hover:bg-blue-700` → `bg-brand-primary hover:opacity-80 text-brand-text font-medium`
- On checkbox inputs: `text-blue-600` → `text-brand-primary`, `focus:ring-blue-500` → `focus:ring-brand-ring`

**Spinners:**
- `border-b-2 border-blue-600` → `border-b-2 border-brand-primary`

**Focus rings on form inputs:**
- `focus:ring-blue-500` → `focus:ring-brand-ring`

**Page titles (h1 elements):**
- `text-gray-900` → `text-brand-text font-heading`

**Empty state text:**
- `text-gray-500` → `text-brand-muted`

**Empty state cards:**
- `bg-white rounded-lg` → `bg-white/80 rounded-xl`

### Per-Component Specifics:

**products.component.ts:**
- Title: `text-gray-900` → `text-brand-text font-heading`
- Add button: blue→brand-primary with dark text
- Spinner: `border-blue-600` → `border-brand-primary`
- Empty state: `text-gray-500` → `text-brand-muted`
- Error banner: keep `bg-red-50 border-red-200 text-red-700` as-is (error states use standard red)

**categories.component.ts:**
- Same patterns as products.component.ts
- Title: add `font-heading`
- Add button: blue→brand-primary
- Spinner: blue→brand-primary

**staff.component.ts:**
- Same patterns as products.component.ts
- Title: add `font-heading`
- Add button: blue→brand-primary
- Spinner: blue→brand-primary

**customers.component.ts:**
- Title: `text-gray-900` → `text-brand-text font-heading`
- Spinner: `border-blue-600` → `border-brand-primary`
- No add button (read-only with logs/delete)

**orders.component.ts:**
- Title: `text-gray-900` → `text-brand-text font-heading`
- Spinner: `border-blue-600` → `border-brand-primary`
- No add button (read-only)

**dashboard.component.ts:**
- Title: `text-gray-900` → `text-brand-text font-heading`
- Stat card bg: keep `bg-white` for contrast, change `rounded-lg` → `rounded-xl`
- Stat card h3: `text-gray-700` → `text-brand-muted`
- Stat values: `text-blue-600` → `text-brand-primary`, keep `text-green-600`/`text-purple-600`/`text-orange-600` as-is (status colors)

**auth.component.ts:**
- Page bg: `bg-gray-100` → `bg-brand-bg`
- Card: `bg-white` → `bg-white` (keep for contrast), `rounded-lg` → `rounded-xl`
- Title: add `font-heading`
- Labels: `text-gray-700` → `text-brand-text`
- Inputs: `border-gray-300` → `border-brand-border`, `focus:ring-blue-500` → `focus:ring-brand-ring`
- Login button: `bg-blue-600 hover:bg-blue-700` → `bg-brand-primary hover:opacity-80 text-brand-text font-medium`
- Error text: keep `text-red-500` as-is

**product-edit-dialog.component.ts:**
- Overlay: `bg-black/50` → `bg-black/10 backdrop-blur-xs`
- Card: `rounded-lg` → `rounded-xl`
- Title: `text-gray-900` → `text-brand-text font-heading`
- Labels: `text-gray-700` → `text-brand-text`
- Inputs: `border-gray-300` → `border-brand-border`, `focus:ring-blue-500` → `focus:ring-brand-ring`
- Cancel: `bg-gray-100 hover:bg-gray-200 text-gray-700` → `bg-brand-secondary hover:opacity-80 text-brand-text`
- Save: `bg-blue-600 hover:bg-blue-700` → `bg-brand-primary hover:opacity-80 text-brand-text font-medium`
- File input: `file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100` → `file:bg-brand-secondary/50 file:text-brand-text hover:file:bg-brand-secondary`

**category-edit-dialog.component.ts:**
- Same overlay/card/title/label/input/cancel/save patterns as product-edit-dialog

**staff-edit-dialog.component.ts:**
- Same overlay/card/title/label/input/cancel/save patterns as product-edit-dialog
- Checkbox: `text-blue-600` → `text-brand-primary`, `focus:ring-blue-500` → `focus:ring-brand-ring`

**customer-edit-dialog.component.ts:**
- Same overlay/card/title/label/input/cancel/save patterns as product-edit-dialog
- Checkbox: `text-blue-600` → `text-brand-primary`, `focus:ring-blue-500` → `focus:ring-brand-ring`
  </action>
  <verify>
    <automated>grep -c "brand-primary\|brand-bg\|brand-text\|brand-secondary\|brand-destructive\|brand-ring\|brand-muted\|brand-border\|font-heading" src/app/features/**/*.component.ts src/app/features/**/components/**/*.component.ts | grep -v ":0$"</automated>
  </verify>
  <done>
    All 12 feature/edit dialog files use brand token utility classes. All primary buttons are gold (brand-primary) with dark text. All spinners use brand-primary border. All page titles have font-heading (Playfair Display). All form inputs use brand-border and brand-ring focus rings. All dialogs use lighter overlay and rounded-xl. No TypeScript logic changed in any file.
  </done>
</task>

</tasks>

<verification>
Run `ng build` (or `npm run build`) to verify all templates compile without errors. Then run `ng serve` and visually verify:
1. Sidebar uses warm brown/cream palette with gold accent on active links
2. All "Add" and "Save" buttons are gold with dark text
3. Dialogs appear with light overlay and rounded corners
4. Delete buttons show red text on light red background (not solid red)
5. Page titles render in Playfair Display serif font
6. Focus rings are gray, not blue
7. Body background is warm cream
</verification>

<success_criteria>
- src/styles.css contains @theme inline block with all 8 brand color tokens + font-heading
- src/index.html loads Geist font
- All 16 component files use brand token utility classes (bg-brand-primary, text-brand-text, etc.)
- Zero TypeScript logic changes (only template class strings modified)
- `ng build` compiles without errors
- Visual inspection confirms warm brown/cream/gold palette matches storefront
</success_criteria>

<output>
After completion, create `.planning/quick/260715-fpt-align-angular-backoffice-ui-ux-brand-ide/260715-fpt-01-SUMMARY.md`
</output>
