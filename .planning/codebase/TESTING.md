# Testing Patterns

**Analysis Date:** 2026-07-06

This monorepo contains three sub-projects with different testing approaches:

| Sub-Project | Framework | Test Runner | Config File |
|-------------|-----------|-------------|-------------|
| `be-cadelfriul/` | JUnit 5 (Jupiter) + Spring Boot Test | Gradle (via JUnit Platform) | `build.gradle.kts` |
| `bo-cadelfriul/` | Vitest (via `@angular/build:unit-test`) | Angular CLI (`ng test`) | `angular.json`, `tsconfig.spec.json` |
| `fe-cadelfriul/` | **Not configured** | None | N/A |

---

## 1. be-cadelfriul — Spring Boot (Java)

### Test Framework

| Aspect | Detail |
|--------|--------|
| **Runner** | JUnit 5 (Jupiter) via `junit-platform-launcher` |
| **Spring Test** | `spring-boot-starter-webmvc-test`, `spring-boot-starter-data-jpa-test`, `spring-boot-starter-security-test` |
| **Config** | `build.gradle.kts` — `useJUnitPlatform()` in `tasks.withType<Test>` |
| **Run command** | `./gradlew test` |

### Dependencies (from `build.gradle.kts`)
```kotlin
testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test")
testImplementation("org.springframework.boot:spring-boot-starter-security-test")
testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
testRuntimeOnly("org.junit.platform:junit-platform-launcher")
```

### Test File Organization

**Location:** Co-located under `src/test/` mirroring source structure:
```
src/test/java/com/cadelfriul/backend/
└── BeCadelfriulApplicationTests.java
```

**Naming:** `*Tests.java` suffix (plural `Tests`).

### Test Structure

The only existing test is the auto-generated Spring Boot context load test:

```java
package com.cadelfriul.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BeCadelfriulApplicationTests {

    @Test
    void contextLoads() {
    }

}
```

**Patterns observed:**
- Class-level `@SpringBootTest` annotation for integration tests
- `@Test` from `org.junit.jupiter.api`
- Default package-private class visibility
- Descriptive method names in camelCase (e.g., `contextLoads`)

### Mocking

**Framework:** Not yet used. Available via:
- `spring-boot-starter-webmvc-test` includes `@WebMvcTest` for controller-layer slicing
- `spring-boot-starter-data-jpa-test` includes `@DataJpaTest` for repository-layer slicing
- `spring-boot-starter-security-test` includes `@WithMockUser`, `SecurityMockMvcRequestPostProcessors`

**Expected patterns (from Spring Boot conventions):**
- `@MockBean` for mocking Spring beans in slice tests
- `MockMvc` for web layer testing
- `TestEntityManager` or `@DataJpaTest` for repository testing

### What to test (no tests exist yet for):
- `Admin`, `AdminRole`, `AdminLog` entities (JPA mapping)
- `SecurityConfig` (security filter chain)
- `OpenApiConfig` (OpenAPI bean creation)
- Future controllers, services, repositories

---

## 2. bo-cadelfriul — Angular (TypeScript)

### Test Framework

| Aspect | Detail |
|--------|--------|
| **Runner** | Vitest (via `@angular/build:unit-test`) |
| **Assertions** | Built-in Vitest (expect, describe, it) + `@angular/core/testing` (TestBed) |
| **Globals** | `vitest/globals` configured in `tsconfig.spec.json` |
| **Config** | `angular.json` — builder: `@angular/build:unit-test` |
| **Run command** | `ng test` |
| **Browser env** | `jsdom` (`^28.0.0` in devDependencies) |

### Test File Organization

**Location:** Co-located with source files (`*.spec.ts`).

**Naming:** `*.spec.ts` suffix.

**Structure:**
```
src/app/
├── app.ts               # Component under test
├── app.spec.ts          # Co-located test file
├── app.html
├── app.css
└── ...
```

### Test Configuration (`tsconfig.spec.json`)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["vitest/globals"]
  },
  "include": [
    "src/**/*.d.ts",
    "src/**/*.spec.ts"
  ]
}
```

**Key: `vitest/globals` type enables `describe`, `it`, `expect`, `beforeEach` without imports.**

### Test Structure

The only existing test validates the root `App` component:

```typescript
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, bo-cadelfriul');
  });
});
```

**Patterns:**
- `TestBed.configureTestingModule()` with `imports: [Component]` (standalone component pattern)
- `compileComponents()` before component creation
- `TestBed.createComponent()` to create component fixture
- `fixture.componentInstance` for programmatic assertions
- `fixture.nativeElement` for DOM assertions
- `fixture.whenStable()` for async render completion
- `describe`/`it` blocks (Vitest globals)
- `expect().toBeTruthy()` for existence checks
- `expect().toContain()` for text content checks

### Mocking

**Framework:** Not yet used. Expected patterns from Angular testing conventions:
- Angular `TestBed` provides `TestModuleMetadata` for dependency injection
- `HttpClientTestingModule` / `HttpTestingController` for HTTP mocking
- Component input/output binding in tests
- `@Component({})` stub declarations for child components

### Fixtures and Factories

**Not yet implemented.** No test data factories, fakers, or fixture files found.

---

## 3. fe-cadelfriul — Next.js (TypeScript/React)

### Test Framework

**Not configured.** Key observations:
- No test framework in `package.json` dependencies
- No test config files (`vitest.config.*`, `jest.config.*`)
- No test files (`*.test.*`, `*.spec.*`)
- `fe-cadelfriul/.gitignore` includes `/coverage` — suggesting future testing setup
- No test script in `package.json` (only `dev`, `build`, `start`, `lint`)

### Recommended Setup

When adding tests, follow the conventions established by the monorepo:
- Use **Vitest** (consistent with `bo-cadelfriul`)
- Configure `vitest/globals` for `describe`/`it`/`expect` availability
- Use `@testing-library/react` for component testing
- Co-locate test files with components (`*.test.tsx` or `*.spec.tsx`)

### Existing test-adjacent files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Strict TypeScript (catches type errors at build time) |
| `eslint.config.mjs` | Lint checks via `eslint-config-next` |

---

## 4. Cross-Project Testing Patterns

### Commonalities
- Both configured projects use modern test runners (JUnit 5 Platform, Vitest)
- Both use globally available assertion/describe macros (`vitest/globals` is opt-in for Angular; JUnit `@Test` is standard Java)
- Neither project has extensive tests yet — both are in early stages

### Gaps
- **fe-cadelfriul** has no test framework at all
- **be-cadelfriul** has only the context-load smoke test
- **bo-cadelfriul** has only the root component smoke test
- No E2E testing framework configured in any sub-project
- No coverage thresholds enforced in any sub-project
- No test data factories or fixtures
- No mocking examples yet

### Run Commands

```bash
# Backend (be-cadelfriul)
./gradlew test

# Backoffice (bo-cadelfriul)
cd bo-cadelfriul && ng test

# Frontend (fe-cadelfriul) — NOT CONFIGURED
# cd fe-cadelfriul && npx vitest     # after setup
```

---

## 5. CI / Automation

- **No CI configuration files found** (no `.github/`, `.gitlab-ci.yml`, etc.)
- Tests must be run manually via the commands above
- No pre-commit hooks detected

---

*Testing analysis: 2026-07-06*
