# Coding Conventions

**Analysis Date:** 2026-07-06

This monorepo contains three sub-projects with distinct conventions:

| Sub-project | Stack | Language |
|-------------|-------|----------|
| `be-cadelfriul/` | Spring Boot 4.1.0 | Java 26 |
| `bo-cadelfriul/` | Angular 21.2 | TypeScript 5.9 |
| `fe-cadelfriul/` | Next.js 16.2 / React 19.2 | TypeScript 5.x |

---

## 1. Naming Patterns

### be-cadelfriul (Java)

**Files:**
- PascalCase matching the public class/enum name: `Admin.java`, `AdminRole.java`, `BeCadelfriulApplication.java`
- Config classes: `*Config.java` — e.g., `SecurityConfig.java`, `OpenApiConfig.java`
- Entity classes: singular nouns — `Admin.java`, `AdminLog.java`
- Test files: `*Tests.java` — e.g., `BeCadelfriulApplicationTests.java`

**Classes:**
- PascalCase — `public class Admin`, `public enum AdminRole`

**Methods & Fields:**
- camelCase — `getPassword()`, `setFullName()`, `addLog()`, `securityFilterChain()`

**Constants / Enums:**
- UPPER_SNAKE_CASE — `SUPER_ADMIN`, `RECEPTIONIST`

**Packages:**
- All lowercase dot-separated: `com.cadelfriul.backend.core.auth.entity`

### bo-cadelfriul (Angular / TypeScript)

**Files:**
- PascalCase for component files: `App.ts`, `App.config.ts`, `App.routes.ts`
- kebab-case for templates/styles: `app.html`, `app.css`, `app.spec.ts`
- `main.ts`, `server.ts` for entry points

**Angular-specific:**
- Component class names: PascalCase — `export class App`
- Selector prefix: `app-` — `selector: 'app-root'`
- File naming convention from Angular CLI scaffolding: `<name>.ts`, `<name>.html`, `<name>.css`, `<name>.spec.ts`

**Functions & Methods:**
- camelCase — `bootstrapApplication()`, `compileComponents()`, `whenStable()`

### fe-cadelfriul (Next.js / React / TypeScript)

**Files:**
- kebab-case for App Router files: `layout.tsx`, `page.tsx`
- `*.tsx` for components with JSX, `*.ts` for pure logic/config
- Config files use `.mjs` extension: `eslint.config.mjs`, `postcss.config.mjs`

**Functions & Components:**
- PascalCase for default-exported component functions: `RootLayout`, `Home`
- camelCase for utility functions, config, variables
- Arrow-function defaults: `export default function Home()`

**Types/Interfaces:**
- PascalCase — `Metadata`, `NextConfig`, `Readonly<{ children: React.ReactNode }>`

---

## 2. Code Style

### be-cadelfriul (Java)

**Indentation:** Tabs (observed in `build.gradle.kts`), with mixed tabs/spaces in entity files (tabs for `BeCadelfriulApplication.java`, 4-space indentation in entity classes).

**Brace placement:** Egyptian style (opening brace on same line) — consistent across all Java files.

**Formatting:** No explicit formatter config detected. Defaults to IDE/IntelliJ formatting.

### bo-cadelfriul (Angular / TypeScript)

**EditorConfig** (`.editorconfig`):
- `indent_style = space`, `indent_size = 2`
- `charset = utf-8`
- `insert_final_newline = true`
- `trim_trailing_whitespace = true`
- Single quotes for TypeScript (`quote_type = single`)

**Prettier** (`.prettierrc`):
- `printWidth: 100`
- `singleQuote: true`
- HTML override: `parser: "angular"`
- **No ESLint configured**

### fe-cadelfriul (Next.js / React / TypeScript)

**ESLint** (`eslint.config.mjs`):
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**TypeScript** (`tsconfig.json`):
- `strict: true`
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- `jsx: "react-jsx"`
- Path alias: `@/*` → `./src/*`

**No Prettier or EditorConfig** detected for the Next.js frontend.

---

## 3. Import Organization

### be-cadelfriul (Java)
1. Package declaration
2. `jakarta.*` imports (JPA)
3. `java.*` imports (stdlib)
4. Spring framework imports
5. Blank line separation between groups

```java
package com.cadelfriul.backend.core.auth.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "admins")
public class Admin {  }
```

### bo-cadelfriul (Angular / TypeScript)
1. Angular core imports (`@angular/core`, `@angular/router`, etc.)
2. Local imports (relative paths with `./`)
3. No barrel files detected — direct file imports

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
```

### fe-cadelfriul (Next.js / React / TypeScript)
1. Framework imports (`next/*`, `react/*`)
2. Local imports (relative paths with `./`)

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
```

**Quote style:** Double quotes in fe-cadelfriul, single quotes in bo-cadelfriul.

---

## 4. Error Handling

### be-cadelfriul (Java)

**Pattern:** No custom error handling implemented yet. The `SecurityConfig.java` disables CSRF and permits all requests (development only). No controllers, services, or exception handlers exist yet.

**Expected Spring patterns (from dependencies):**
- `spring-boot-starter-webmvc` — standard `@ControllerAdvice` + `@ExceptionHandler`
- `spring-boot-starter-data-jpa` — `@Repository` + `DataIntegrityViolationException` handling via Spring's `ResponseEntityExceptionHandler`

### bo-cadelfriul (Angular / TypeScript)

**Pattern:** Global error listeners enabled in `app.config.ts`:
```typescript
provideBrowserGlobalErrorListeners()
```

**Server errors:** Express middleware with `.catch(next)` pattern:
```typescript
angularApp
  .handle(req)
  .then((response) =>
    response ? writeResponseToNodeResponse(response, res) : next(),
  )
  .catch(next);
```

**Client-side errors:** Via `console.error` in `main.ts`:
```typescript
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

### fe-cadelfriul (Next.js / React / TypeScript)

**Pattern:** No custom error handling implemented. No error boundaries, try/catch blocks, or error pages found.

**Expected patterns:**
- Next.js App Router supports `error.tsx` (error boundaries), `not-found.tsx`, and `loading.tsx` — none implemented yet.

---

## 5. Logging

### be-cadelfriul (Java)
- Spring Boot default logging (SLF4J + Logback)
- No custom logging configuration detected
- Hibernate SQL logging enabled: `spring.jpa.show-sql=true`, `spring.jpa.properties.hibernate.format_sql=true`

### bo-cadelfriul (Angular / TypeScript)
- `console.log()` in server startup (`server.ts`): `console.log(`Node Express server listening on http://localhost:${port}`)`
- `console.error()` in bootstrap error handler (`main.ts`)
- No structured logging framework

### fe-cadelfriul (Next.js / React / TypeScript)
- No logging detected in source files
- Next.js provides built-in logging

---

## 6. Comments

### be-cadelfriul (Java)
- **Language:** Italian for domain/business comments
- **Style:** `// Single-line comments` with leading space
- **Types:**
  - Section headers: `// --- COSTRUTTORI ---`
  - Entity relationship descriptions: `// Relazione Uno-a-Molti: ...`
  - Helper method descriptions: `// Metodo helper per aggiungere un log facilmente...`
  - Configuration comments: `# --- CONFIGURAZIONE DATABASE POSTGRESQL ---`

### bo-cadelfriul (Angular / TypeScript)
- Sparse — only auto-generated comments in scaffolding templates
- JSDoc-style doc blocks in `server.ts` for function documentation:
  ```typescript
  /**
   * Example Express Rest API endpoints can be defined here.
   */
  ```

### fe-cadelfriul (Next.js / React / TypeScript)
- No comments in source files

---

## 7. Component / Module Design

### be-cadelfriul (Java)
**Entities:**
- JPA `@Entity` with `@Table` annotation
- UUID primary keys with `GenerationType.UUID`
- No-arg constructors required by JPA
- Full constructor for business use
- `@OneToMany`/`@ManyToOne` relationships with `mappedBy` and `cascade`
- Helper methods that maintain bidirectional relationship consistency (`addLog`)
- `fetch = FetchType.LAZY` on `@ManyToOne`

**Config:**
- `@Configuration` + `@Bean` pattern
- Separate config classes per domain: `SecurityConfig.java`, `OpenApiConfig.java`

### bo-cadelfriul (Angular / TypeScript)
**Components:** Standalone (no NgModules), `@Component` with:
- `selector`: prefix `app-`
- `imports`: array for dependencies
- `templateUrl` + `styleUrl` (external files)
- Signal-based state: `title = signal('bo-cadelfriul')`

**Routing:**
- Standalone route config via `provideRouter(routes)`
- Routes exported as `const routes: Routes = []`

### fe-cadelfriul (Next.js / React / TypeScript)
- App Router with `layout.tsx` and `page.tsx`
- Default exports for page components
- `Readonly<>` prop type pattern for layout component
- `next/font/google` for font loading

---

## 8. CSS / Styling

**Both frontends use Tailwind CSS v4:**
- `bo-cadelfriul`: `@import 'tailwindcss'` in `styles.css`, PostCSS config in `.postcssrc.json`
- `fe-cadelfriul`: `@import "tailwindcss"` in `globals.css`, PostCSS config in `postcss.config.mjs`
- `@theme inline` directive for custom theme tokens (fe-cadelfriul)
- `@media (prefers-color-scheme: dark)` for dark mode support (fe-cadelfriul)

---

## 9. File and Directory Structure Patterns

### be-cadelfriul
```
src/main/java/com/cadelfriul/backend/
├── BeCadelfriulApplication.java      # Entry point
└── core/
    ├── auth/
    │   └── entity/                    # JPA entities
    │       ├── Admin.java
    │       ├── AdminLog.java
    │       └── AdminRole.java
    └── config/                        # Spring configuration
        ├── OpenApiConfig.java
        └── SecurityConfig.java
```

### bo-cadelfriul
```
src/
├── index.html                        # Root HTML
├── main.ts                           # Browser bootstrap
├── main.server.ts                    # Server bootstrap
├── server.ts                         # Express SSR server
├── styles.css                        # Global styles (Tailwind)
└── app/                              # Feature modules
    ├── app.ts                        # Root component
    ├── app.html                      # Root template
    ├── app.css                       # Root styles
    ├── app.config.ts                 # App configuration
    ├── app.config.server.ts          # Server config
    ├── app.routes.ts                 # Route definitions
    ├── app.routes.server.ts          # Server routes
    └── app.spec.ts                   # Root component test
```

### fe-cadelfriul
```
src/app/
├── layout.tsx                        # Root layout
├── page.tsx                          # Home page
└── globals.css                       # Global styles (Tailwind)
```

---

*Convention analysis: 2026-07-06*
