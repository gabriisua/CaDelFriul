# Coding Conventions

**Analysis Date:** 2026-07-08

## Naming Patterns

**Files:**
- React components/Pages: PascalCase — `layout.tsx`, `page.tsx`
- Utility/config files: kebab-case — `globals.css`, `next.config.ts`, `eslint.config.mjs`
- TypeScript definition files: PascalCase or kebab-case — `next-env.d.ts`
- **Prescription:** Use PascalCase for component files (`UserProfile.tsx`, `Navbar.tsx`), kebab-case for utilities/hooks (`use-auth.ts`, `api-client.ts`)

**Functions:**
- Default exports in pages/components: PascalCase named function — `export default function Home()`, `export default function RootLayout()`
- **Prescription:** Use `camelCase` for utility/helper functions, PascalCase for React components (default export). Prefer named function declarations over arrow-assigned `const` for default-exported components.

**Variables:**
- All `camelCase` — `const geistSans`, `const geistMono`, `const nextConfig`, `const eslintConfig`
- **Prescription:** Use `camelCase` for all local variables and constants. Use `UPPER_SNAKE_CASE` only for truly global compile-time constants (e.g., `API_BASE_URL`, `MAX_RETRIES`).

**Types:**
- TypeScript interfaces and type aliases: PascalCase — `Metadata` (from `next`), `NextConfig`, `Readonly<{ children: React.ReactNode }>`
- **Prescription:** Use PascalCase for all type/interface names. Prefix prop types with the component name: `UserProfileProps`. Use `type` over `interface` for union types, `interface` for object shapes that may be extended.

## Code Style

**Formatting:**
- No Prettier config detected. ESLint 9 flat config with `eslint-config-next` handles style rules.
- TypeScript strict mode enabled (`strict: true` in `tsconfig.json`).
- Target ES2017, module resolution `bundler`, JSX `react-jsx`.
- **Prescription:** Install and configure Prettier with a root `.prettierrc`:
  ```json
  {
    "semi": true,
    "singleQuote": false,
    "tabWidth": 2,
    "trailingComma": "all",
    "printWidth": 100,
    "bracketSpacing": true
  }
  ```
  Add format script: `"format": "prettier --write ."`. Consider `eslint-config-prettier` to avoid conflicts.

**Linting:**
- **Tool:** ESLint 9 (flat config)
- **Config file:** `eslint.config.mjs`
- **Rules used:** `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` (Next.js 16.2.10)
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- **Prescription:** Do NOT add `.eslintrc.*` — the project uses the flat config format (`eslint.config.mjs`). Extend it with additional rules as needed:
  ```js
  // eslint.config.mjs
  import { defineConfig, globalIgnores } from "eslint/config";
  import nextVitals from "eslint-config-next/core-web-vitals";
  import nextTs from "eslint-config-next/typescript";

  const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
      rules: {
        // Add project-specific rules here
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]),
  ]);

  export default eslintConfig;
  ```

## Import Organization

**Order (observed in existing files):**
1. External type imports: `import type { Metadata } from "next";`
2. External value imports: `import { Geist, Geist_Mono } from "next/font/google";`
3. Side-effect CSS imports: `import "./globals.css";`
4. Component imports: `import Image from "next/image";`

**Prescription:**
Group imports in this order, separated by blank lines:
1. **Types** — `import type { ... } from "..."` (use `type` modifier for type-only imports)
2. **External libraries** (React, Next.js, third-party)
3. **Internal modules** (`@/...` path aliases)
4. **Relative imports** (`./...`, `../...`)
5. **CSS/styles** side-effect imports

Within each group, sort alphabetically by source path.

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)
- Use `@/` prefix for all intra-app imports. Avoid deep relative paths (e.g., `../../../utils`).
- **Example:** `import { Button } from "@/components/ui/button";`

## Error Handling

**Strategy (observed):**
- No custom error handling patterns detected (boilerplate codebase).
- TypeScript strict mode (`strict: true`) catches null/undefined at compile time.
- `next.config.ts` shows `reactCompiler: true` — React Compiler for automatic memoization.

**Prescription for this project:**
- **Client components:** Use React 19 `useActionState` for form errors, error boundaries via `error.tsx` files per Next.js App Router convention.
- **Server components / Server Actions:** Use `try/catch` blocks, return `{ success: boolean, error?: string }` shaped responses.
- **Global errors:** Create `src/app/global-error.tsx` for top-level runtime error UI.
- **API client errors:** Create a typed fetch wrapper that throws typed errors:
  ```typescript
  export class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  }
  ```
- **Avoid** `throw` in Server Actions — return error objects instead (Next.js 16 conventions).

## Logging

**Framework:** None detected. Default `console` usage.

**Prescription:**
- Use `console.error` for errors in server-side code (Next.js logs them to stderr).
- Use `console.warn` for recoverable issues during development.
- Avoid `console.log` in production client bundles. Use the ESLint rule `no-console: ["warn", { allow: ["warn", "error"] }]`.
- For structured logging in production, consider `pino` or a lightweight logger with log levels.

## Comments

**When to Comment:**
- No comments in existing code (clean boilerplate).
- **Prescription:** Write self-documenting code with clear function/variable names. Use comments only when:
  - Explaining _why_ a non-obvious approach was chosen.
  - Documenting complex business logic.
  - Marking work-in-progress with `TODO(username):` or `HACK:` prefixed comments.

**JSDoc/TSDoc:**
- Not used in current codebase.
- **Prescription:** Use TSDoc for exported utility functions and public APIs:
  ```typescript
  /** Formats a date string for the Italian locale. */
  export function formatDate(date: Date): string { ... }
  ```
- React components: Document the `Props` type, not the component itself with JSDoc.

## Function Design

**Size:**
- Existing components: 33 lines (`layout.tsx`), 65 lines (`page.tsx`).
- **Prescription:** Keep functions under 40 lines. Extract nested logic into named helper functions. React components should ideally stay under 80 lines of JSX.

**Parameters:**
- React components use a single `Props` type parameter — `Readonly<{ children: React.ReactNode }>`.
- **Prescription:** Always use a single props object for React components. For utility functions, use 1-3 positional parameters. Consider a config object for 4+ parameters.

**Return Values:**
- React components: JSX elements (implicit return).
- **Prescription:** Prefer implicit return for simple arrow functions. Use explicit blocks for multi-statement functions. Server Actions should return typed objects, not throw.

## Module Design

**Exports:**
- Existing pattern: `export default function` for page/layout components (Next.js convention).
- `export default` for config objects (`nextConfig`, `eslintConfig`).
- Named exports used for config functions (`defineConfig`, `globalIgnores` from eslint).

**Prescription:**
- **Component files:** One default export (the component) + named exports for types, sub-components, and helpers.
- **Utility files:** Named exports only (no default export). This enables better tree-shaking and IDE autocompletion.
- **Library files:** Named exports throughout. Use barrel files (`index.ts`) at directory roots to re-export.

**Barrel Files:**
- Not present yet.
- **Prescription:** Create `index.ts` files at component/module directory roots that re-export public API:
  ```typescript
  // src/components/ui/index.ts
  export { Button } from "./button";
  export type { ButtonProps } from "./button";
  ```

## Tailwind CSS Conventions

**Observed:**
- Tailwind CSS v4, configured via `@import "tailwindcss"` in `globals.css`.
- Theme customization via `@theme inline { ... }` block.
- Dark mode via `@media (prefers-color-scheme: dark)` (system-level).
- Utility classes used extensively: `flex`, `flex-col`, `items-center`, `justify-center`, etc.

**Prescription:**
- Use `@theme inline` for design tokens (colors, fonts, spacing) in `globals.css`.
- Prefer Tailwind utility classes over custom CSS. Extract repeated patterns into React components, not CSS classes.
- Use Tailwind's `@apply` sparingly — only for genuinely atomic design tokens that appear 5+ times.
- Use `cn()` helper for conditional class merging (install `clsx` + `tailwind-merge`).

## React Compiler (React 19)

- **Enabled:** `reactCompiler: true` in `next.config.ts`.
- **Implication:** React Compiler automatically memoizes components, hooks, and callbacks. Manual `useMemo`/`useCallback`/`React.memo` are generally unnecessary.
- **Prescription:** Do NOT wrap in `React.memo`, `useMemo`, or `useCallback` by default. Only add manual memoization after profiling demonstrates a performance issue.

## TypeScript Strict Mode

- **Enabled:** `strict: true` in `tsconfig.json`.
- **Prescription:** Never disable strict mode. Use `// @ts-expect-error` with a comment explaining why when you must bypass — never use `// @ts-ignore` (deprecated).

---

*Convention analysis: 2026-07-08*
