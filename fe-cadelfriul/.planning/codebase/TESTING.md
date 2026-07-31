# Testing Patterns

**Analysis Date:** 2026-07-08

## Test Framework

**Status:** Not configured. No test runner, assertion library, or test files detected.

**Recommended Setup:**

This is a greenfield Next.js 16 + React 19 + TypeScript 5 project. The following setup is prescribed:

**Runner + Assertions (Vitest — recommended for Next.js + Vite-compatible projects):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Config file (`vitest.config.ts`):**
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/testing/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/app/layout.tsx",
        "src/app/globals.css",
        "next.config.ts",
        "eslint.config.mjs",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Setup file (`src/testing/setup.ts`):**
```typescript
import "@testing-library/jest-dom/vitest";
```

**Run Commands:**
```bash
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
npm run test -- --coverage # Coverage report
npm run test -- --ui      # Vitest UI (if @vitest/ui installed)
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Alternative (Playwright for E2E):**
```bash
npm install -D @playwright/test
npx playwright init
```

## Test File Organization

**Status:** No test files exist yet.

**Prescription:**

**Location:** Co-located with source files. Each module's tests live next to the implementation.

**Naming:** `*.test.ts` (unit tests), `*.test.tsx` (component tests), `*.e2e.ts` (E2E tests).

**Structure:**
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   └── index.ts
│   └── features/
│       ├── user-profile.tsx
│       └── user-profile.test.tsx
├── lib/
│   ├── api-client.ts
│   ├── api-client.test.ts
│   ├── utils.ts
│   └── utils.test.ts
└── testing/
    ├── setup.ts
    ├── mocks/
    │   ├── next-navigation.ts
    │   └── server-actions.ts
    └── fixtures/
        └── user.ts
```

## Test Structure

**Prescription — use describe/it blocks following AAA pattern (Arrange, Act, Assert):**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import type { ButtonProps } from "./button";

describe("Button", () => {
  it("renders children text", () => {
    // Arrange
    render(<Button>Click me</Button>);

    // Act
    const button = screen.getByRole("button", { name: /click me/i });

    // Assert
    expect(button).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

**Common test file structure:**
```typescript
// External imports
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Internal imports
import { ComponentName } from "./component-name";
```

## Mocking

**Status:** Not configured.

**Prescription:**

**Framework:** Vitest built-in (`vi.mock`, `vi.fn`, `vi.spyOn`).

**Key patterns:**

**Mocking external modules (Next.js navigation):**
```typescript
// src/testing/mocks/next-navigation.ts
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));
```

**Mocking Server Actions:**
```typescript
vi.mock("@/app/actions", () => ({
  createUser: vi.fn().mockResolvedValue({ success: true, id: "1" }),
}));
```

**Mocking fetch:**
```typescript
globalThis.fetch = vi.fn();
// In test:
vi.mocked(fetch).mockResolvedValueOnce(
  new Response(JSON.stringify({ data: "ok" }), { status: 200 })
);
```

**What to Mock:**
- Network requests (fetch, axios)
- Browser APIs (localStorage, IntersectionObserver)
- Next.js navigation hooks (`useRouter`, `useSearchParams`)
- Third-party SDK clients (Stripe, Supabase, etc.)
- Server Actions in client component tests

**What NOT to Mock:**
- Pure utility functions
- React component internals (test behavior, not implementation)
- TypeScript types and interfaces

## Fixtures and Factories

**Status:** Not present.

**Prescription:**

**Test Data Pattern:**
```typescript
// src/testing/fixtures/user.ts
export const createUserFixture = (overrides: Partial<User> = {}) => ({
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "customer" as const,
  createdAt: new Date("2026-01-01"),
  ...overrides,
});
```

**Location:** `src/testing/fixtures/` — one file per domain entity.

## Coverage

**Status:** Not enforced.

**Recommended target:** 80% line coverage for business logic (`src/lib/`, `src/actions/`), 60% for UI components (`src/components/`).

**View Coverage:**
```bash
npx vitest run --coverage
```

Coverage reports to terminal + `coverage/` directory (gitignored).

**CI Integration:** Fail CI if coverage drops below thresholds.

## Test Types

**Unit Tests — Prescription:**
- Pure function tests in `src/lib/`
- Component rendering tests in `src/components/`
- Server Action logic tests (call the action, assert returned shape)
- No API calls, no browser — all async boundaries mocked

**Integration Tests — Prescription:**
- Co-located `*.test.tsx` files in feature directories
- Test a feature holistically: render a page, simulate user flow, assert UI state changes
- Mock Server Actions but test the full component tree

**E2E Tests — Prescription (Playwright):**
```typescript
// src/app/page.e2e.ts
import { test, expect } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("To get started")).toBeVisible();
});
```

**Not used currently — add Playwright when E2E coverage is needed.**

## Testing Guidelines for Next.js 16 + React 19

**React Compiler (`reactCompiler: true`):**
- `React.memo`, `useMemo`, `useCallback` are auto-injected by the compiler.
- Do NOT test for memoization behavior — test rendered output and interactions only.

**Server Components (RSC):**
- Server Components cannot be rendered in jsdom (they need a Node environment).
- **Prescription:** Extract interactive parts into Client Components (marked with `"use client"`) and test those. Test Server Components via integration/E2E tests only.

**Server Actions:**
- Test Server Action logic directly in unit tests (they are async functions):
  ```typescript
  import { createUser } from "@/app/actions";
  import { describe, it, expect } from "vitest";

  describe("createUser", () => {
    it("returns success with valid data", async () => {
      const result = await createUser({ name: "Test" });
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });
  ```

**`useActionState` (React 19):**
- Test the initial state and the action result separately. The hook state can be derived from the action return value.

## Common Patterns

**Async Testing:**
```typescript
it("loads and displays data", async () => {
  // Use findByRole / findByText for async rendering
  render(<AsyncComponent />);
  expect(await screen.findByText("Loaded")).toBeInTheDocument();
});
```

**Error Testing (component error boundary):**
```typescript
it("renders error state", async () => {
  render(<ErrorComponent />);
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

**Form Testing with `userEvent`:**
```typescript
it("submits the form", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<FormComponent onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/name/i), "Test User");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Test User" })
  );
});
```

---

*Testing analysis: 2026-07-08*
