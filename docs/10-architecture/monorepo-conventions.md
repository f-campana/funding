# Monorepo Conventions — Funding Workspace

This document describes the monorepo structure and conventions agents must
follow when creating files and config in `/Users/fabiencampana/Documents/funding`.

---

## 1. Repository structure

```
funding/                             ← repo root
├── packages/
│   ├── core/                        ← algebraic data types
│   │   ├── src/
│   │   │   ├── option.ts
│   │   │   ├── option.test.ts
│   │   │   ├── result.ts
│   │   │   ├── result.test.ts
│   │   │   ├── async-data.ts
│   │   │   ├── async-data.test.ts
│   │   │   ├── future.ts
│   │   │   ├── future.test.ts
│   │   │   ├── ts-pattern-compat.test-types.ts
│   │   │   ├── adapters/
│   │   │   │   ├── tanstack-query.ts
│   │   │   │   ├── zod.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   ├── domain/                      ← domain types, schemas, money
│   ├── design-tokens/               ← token source and generated CSS
│   ├── tailwind-config/             ← shared Tailwind v4 CSS entrypoint
│   ├── ui/                          ← generic Shadcn-style primitives
│   ├── kit/                         ← composed product components
│   ├── typescript-config/           ← shared tsconfig presets
│   └── test-config/                 ← shared Vitest config factories
│
├── apps/
│   ├── web/                         ← minimal Next.js app
│   └── storybook/                   ← standalone Storybook workspace app
│
├── biome.json                       ← live Biome config
├── package.json                     ← pnpm workspace root
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 2. Package naming

The workspace scope is `@repo`. All internal packages use this scope.

```
@repo/core     — this package
@repo/domain   — domain types, schemas, money
@repo/design-tokens
@repo/tailwind-config
@repo/ui       — Shadcn components
@repo/kit      — composed design system
@repo/typescript-config
@repo/test-config
@repo/web
@repo/storybook
```

The package name in `packages/core/package.json` is `@repo/core`.

---

## 3. `packages/core/package.json`

```json
{
  "name": "@repo/core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    },
    "./adapters/tanstack-query": {
      "import": "./src/adapters/tanstack-query.ts",
      "types": "./src/adapters/tanstack-query.ts"
    },
    "./adapters/zod": {
      "import": "./src/adapters/zod.ts",
      "types": "./src/adapters/zod.ts"
    }
  },
  "scripts": {
    "build": "tsc --noEmit -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "biome check ./src",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@repo/test-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@tanstack/react-query": "^5.100.9",
    "@vitest/coverage-v8": "^4.1.5",
    "fast-check": "^4.7.0",
    "ts-pattern": "^5.9.0",
    "vitest": "^4.1.5",
    "zod": "^4.4.3"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.100.9",
    "ts-pattern": "^5.9.0",
    "zod": "^4.4.3"
  },
  "peerDependenciesMeta": {
    "@tanstack/react-query": {
      "optional": true
    },
    "ts-pattern": {
      "optional": true
    },
    "zod": {
      "optional": true
    }
  }
}
```

**Zero runtime dependencies.** `@repo/core` has no `dependencies` field.
`fast-check`, `vitest`, and adapter libraries needed by tests are dev
dependencies only. `@tanstack/react-query`, `ts-pattern`, and `zod` are optional
peer dependencies because their adapter or compatibility surfaces are separate
export paths.

---

## 4. `packages/core/tsconfig.json`

```json
{
  "extends": "../typescript-config/node-library.json",
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```

Shared TypeScript presets live in `packages/typescript-config`.
The base preset currently contains:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "lib": ["ES2022"],
    "strict": true,
    "useUnknownInCatchVariables": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Critical flags:**
- `exactOptionalPropertyTypes` — `{ x?: string }` cannot be assigned `{ x: undefined }`.
  This matters for the `Option` type where presence/absence is meaningful.
- `noUncheckedIndexedAccess` — `array[0]` returns `T | undefined`, not `T`.
  Forces explicit handling of potentially undefined array access.
- `strict: true` — implies `strictNullChecks`, `strictFunctionTypes`,
  `strictBindCallApply`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`.
- `skipLibCheck: true` — pragmatic default for a dependency-heavy React/Next
  monorepo. We keep our own packages strict while avoiding broken third-party
  `.d.ts` files blocking unrelated work.
- `verbatimModuleSyntax` — keeps imports explicit and reinforces `import type`.
- `esModuleInterop: true` — accepted workspace baseline. Keep import discipline
  through `verbatimModuleSyntax` and Biome's type-import rules.

---

## 5. `pnpm-workspace.yaml` (root)

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

---

## 6. `turbo.json` (root)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

The `^` prefix means "run this task in all dependencies first."
`packages/core` has no internal dependencies (it has zero runtime deps),
so its build runs first in the graph.

---

## 7. Dependency versions

This repo currently uses direct semver ranges in package manifests, not a pnpm
catalog. A catalog may be introduced later once the package set stabilizes, but
agents must not introduce `catalog:` references unless a dedicated dependency
management loop updates the whole workspace consistently.

```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.4.14",
    "typescript": "^6.0.3",
    "vitest": "^4.1.5"
  }
}
```

---

## 8. Import conventions

**Within `packages/core`:** use relative imports only.
```typescript
import { Option } from './option'          // ✅
import { Option } from '@repo/core'        // ❌ — circular self-import
```

**From other packages** (not applicable to core, which has no internal deps):
```typescript
import { Result } from '@repo/core'        // ✅
import { Result } from '../../core/src/result' // ❌ — never use relative cross-package paths
```

**Import ordering** (Biome enforces this automatically):
1. Node built-ins
2. External dependencies
3. Internal packages (`@repo/*`)
4. Relative imports

**Type imports:** always use `import type` for type-only imports.
```typescript
import type { Option } from './option'     // ✅ for type-only usage
import { Option } from './option'          // ✅ when using Option as a value (constructor)
```

---

## 9. The `src/index.ts` barrel

Export everything from `index.ts`. Keep it flat — do not namespace exports
unless there is a naming collision.

```typescript
// src/index.ts
export { Option } from './option'
export type { SomeOption, NoneOption } from './option'

export { Result } from './result'
export type { OkResult, ErrorResult } from './result'

export { AsyncData } from './async-data'
export type { NotAskedData, LoadingData, DoneData } from './async-data'

export { Future } from './future'
export type { CancelFn } from './future'
```

Do NOT re-export from `src/adapters/index.ts` in the main barrel.
Adapters are imported via their explicit path only.

---

## 10. Verification commands

After each milestone, run all three. All must pass before proceeding.

```bash
# From packages/core/
pnpm typecheck       # tsc --noEmit — zero type errors
pnpm lint             # biome check — zero lint errors
pnpm test:coverage    # vitest — 100% coverage, all laws passing
```

From the repo root (runs all packages):
```bash
pnpm turbo typecheck lint test
```
