# AGENTS.md — Ciracet Corrective Action SPFx Web Part

## Project Overview

SharePoint Framework (SPFx) 1.18.2 client-side web part built with React 17, TypeScript 4.7, Fluent UI v8, and PnPjs v3. Deployed to `ciracetcorp.sharepoint.com/sites/CapaCiracet`. Single bundle, no code splitting.

---

## Environment

- **Node:** 18 (see `.nvmrc`). Use `nvm use` before any build steps.
- **Package manager:** npm (do not use yarn or pnpm).
- **Build system:** Gulp 4 via `@microsoft/sp-build-web`.

---

## Commands

| Task | Command |
|------|---------|
| Local dev server | `npm run serve` → `gulp serve` |
| Development bundle | `npm run build` → `gulp bundle` |
| Production package | `npm run package` → `gulp bundle --ship && gulp package-solution --ship` |
| Clean output | `npm run clean` → `gulp clean` |
| Run tests | `npm test` → `gulp test` |

### Notes on testing

There are **no test files** in this repository. `gulp test` runs the SPFx default stub and exits cleanly. When adding tests, place them alongside source files as `*.test.ts` / `*.test.tsx`. There is no Jest config to create — the SPFx build rig picks them up automatically.

To run a single test file once Jest support is wired in:
```sh
npx jest src/webparts/correctiveActionForm/components/MyComponent.test.tsx
```

---

## Source Layout

```
src/webparts/correctiveActionForm/
├── components/          # React components (tsx)
│   ├── CorrectiveActionFormApp.tsx   # View router (dashboard | form | edit)
│   ├── CorrectiveActionForm.tsx      # Main form (685 lines)
│   ├── Dashboard.tsx                 # List/search view
│   └── FormFields.tsx                # Reusable field wrappers
├── models/
│   └── ICorrectiveAction.ts          # Interfaces + dropdown option constants
├── services/
│   └── SharePointService.ts          # All PnPjs / SharePoint API calls
├── loc/                              # i18n strings (en-us.js, mystrings.d.ts)
└── CorrectiveActionFormWebPart.ts    # SPFx web part entry point
```

---

## TypeScript

`tsconfig.json` extends `@microsoft/rush-stack-compiler-4.7`. Key flags:

- `strictNullChecks: false` — null/undefined are **not** type-checked at compile time.
- `noImplicitAny: false` — `any` types are allowed and used in service mapping.
- `noUnusedLocals: false` — unused variables do not error.
- `experimentalDecorators: true` — required for the SPFx web part base class.
- Output goes to `lib/`; never edit files in `lib/` or `dist/`.

Do not add `strict: true` — it will break existing code across the service layer.

---

## Code Style Guidelines

### Naming Conventions

- **Interfaces:** prefix with `I` — `ICorrectiveAction`, `ITextFieldProps`.
- **Component props interfaces:** `I<ComponentName>Props` — `IDashboardProps`.
- **React components:** PascalCase — `Dashboard`, `FormTextField`.
- **Source files:** PascalCase for `.ts`/`.tsx` — `SharePointService.ts`, `FormFields.tsx`.
- **State variables:** camelCase — `formData`, `isEditMode`, `ncOptions`.
- **Event handlers:** camelCase with `handle` prefix — `handleSave`, `handleNCReportNumberChange`.
- **Loader functions:** `loadData`, `loadInitialData`.
- **Service methods:** camelCase verb phrases — `getCorrectiveActionById`, `createCorrectiveAction`.
- **Constants (module scope):** camelCase — `stackTokens`, `dropdownStyles`.

### Imports

Use the SPFx namespace-import pattern for React and ReactDOM:
```ts
import * as React from 'react';
import * as ReactDom from 'react-dom';
```

Use named imports for Fluent UI, aliasing where names collide:
```ts
import { Stack, PrimaryButton, Spinner } from '@fluentui/react';
import { IDropdownOption as IFluentDropdownOption } from '@fluentui/react';
```

Use side-effect imports to augment the PnPjs fluent API:
```ts
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
```

Use relative paths for internal modules:
```ts
import { SharePointService } from '../services/SharePointService';
import { ICorrectiveAction } from '../models/ICorrectiveAction';
```

### Components

- All components are **functional** using `React.FC<TProps>`.
- Reference hooks as `React.useState`, `React.useEffect`, `React.useMemo` (not destructured imports).
- Instantiate the service exactly once per component with `React.useMemo`:
  ```ts
  const spService = React.useMemo(() => new SharePointService(props.context), [props.context]);
  ```
- Define layout constants (tokens, styles) at **module scope**, outside the component function.
- Use a single `useState` object for the entire form shape; update via a generic helper:
  ```ts
  const updateField = (field: keyof ICorrectiveAction, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  ```
- Render loading states as an early return with a centered `<Spinner>`.

### JSX Patterns

- Layout primitive is Fluent UI `<Stack>` everywhere — do not introduce additional layout libraries.
- Use inline `style` objects for one-off adjustments (no CSS Modules, no SCSS files in this project).
- Conditional rendering: `{condition && <Component />}` for show/hide; ternary for value expressions.
- Use `{/* Section Name */}` JSX comments as section dividers inside large render functions.

### Error Handling

- Wrap all async operations in `try/catch/finally`.
- Always clear loading state in `finally`:
  ```ts
  try {
    setSaving(true);
    await spService.createCorrectiveAction(formData);
  } catch (err) {
    setError(err.message || 'Failed to save');
  } finally {
    setSaving(false);
  }
  ```
- In the service layer: `console.error(...)` then `throw new Error(...)` for fatal failures; return `null` for recoverable not-found cases.
- Guard against undefined SharePoint fields with `|| ''` fallbacks in all mapping functions.
- Use `|| ''` / `|| []` / `|| 0` inline defaults, not optional chaining `?.` (aligns with `strictNullChecks: false`).

### Service Layer

- `SharePointService` is the **only** place that calls PnPjs or any SharePoint REST API.
- Maintain explicit bidirectional field-name mapping between clean model properties and SharePoint internal column names (e.g., `CauseAndEffectAnalysis2` ↔ `CauseandEffectAnalysis_x0023_2`).
- For user fields, use the `"id|loginName"` string encoding convention (e.g., `"42|i:0#.f|membership|user@domain.com"`).
- Parse user strings with: `value.includes('|') ? value.split('|')[0] : value`.
- Resolve multiple users in parallel: `await Promise.all(userIds.map(id => spService.resolveUser(id)))`.

---

## Linting

ESLint 8 is configured via the SPFx build rig (`@microsoft/eslint-config-spfx`). There is no `.eslintrc` file to edit. The rig runs during `gulp bundle`. There is no Prettier configured — do not add it without team agreement.

---

## SharePoint / SPFx Specifics

- Never edit files under `lib/`, `dist/`, `release/`, `temp/`, or `sharepoint/solution/` — all are build artifacts.
- The `config/serve.json` points to the live tenant. Always use a dev site or test list when serving locally.
- The `--ship` flag is required for production bundle + package (`npm run package`).
- The `.sppkg` produced in `sharepoint/solution/` is uploaded to the SharePoint App Catalog for deployment.
- SPFx web part property pane changes go in `CorrectiveActionFormWebPart.ts`, not in components.
