# COPILOT_CONTEXT.md
> **Purpose:** This file is the single source of truth for how we structure and implement this Angular frontend.  
> **Target audience:** GitHub Copilot / Copilot Chat (and any contributor).  
> **Non-negotiable guardrail:** **Do not invent requirements, endpoints, or domain logic.** Use existing code + this doc + user-provided requirements only.

---

## Tech Stack (Source of Truth)

- Angular (standalone components)
- Angular Router
- Kendo UI for Angular
- RxJS (Reactive Extensions for JavaScript)
- NgRX (Store + Effects)
- Less styling

### Generated API SDK (Do Not Edit)
- Location: `src/app/core/api/generated/`
- This is OpenAPI SDK output. **Never edit files inside `generated/`.**
- Effects may call these generated clients directly.

---

## Naming Conventions

- **Component class names:** `PascalCase` (e.g., `FinancialAdvisorSummaryPageComponent`)
- **File names:** `kebab-case` (e.g., `financial-advisor-summary-page.component.ts`)
- **Folder names:** `PascalCase` for feature/use-case folders (e.g., `FinancialAdvisorSummary/`), and conventional caps for subfolders:
  - `Components/`, `State/`, `...Page/`

---

## Project Folder Structure (Source of Truth)

### Current Top-Level Structure (Under `src/app/`)
```
src/app/
  core/
    api/
      generated/        # OpenAPI SDK output - DO NOT EDIT
    state/              # Global state ONLY
    ui/                 # App shell layout components
      TabbedShell/      # Single-page app shell, tabbed using Kendo TabStrip
    shared/
      ui/               # Reusable presentational components
      kendo/            # Shared Kendo config (e.g., grid defaults, helpers)
      utils/
  features/
    FinancialAdvisorSummary/
    MonthlyTrend/
    InsuranceCarrierBreakdown/
```

### Desired Use-Case Folder Structure (Template)
Each use case lives in its own folder under `src/app/features/`.

```
features/
  FinancialAdvisorSummary/
    FinancialAdvisorSummaryPage/
      financial-advisor-summary-page.component.ts
      financial-advisor-summary-page.component.html
      financial-advisor-summary-page.component.less

    Components/
      financial-advisor-grid.component.ts

    State/
      financial-advisor-summary.actions.ts
      financial-advisor-summary.reducer.ts
      financial-advisor-summary.selectors.ts
      financial-advisor-summary.effects.ts
```

---

## Routing Rules (Angular Router)

### Rule
- **All routes are defined centrally** in: `src/app/app.routes.ts`
- Feature routes may be defined inline or imported, but composition happens in `app.routes.ts`.

### Example: `app.routes.ts`
```ts
import { Routes } from '@angular/router';
import { TabbedShellComponent } from './core/ui/TabbedShell/tabbed-shell.component';
import { FinancialAdvisorSummaryPageComponent } from './features/FinancialAdvisorSummary/FinancialAdvisorSummaryPage/financial-advisor-summary-page.component';

export const routes: Routes = [
  {
    path: '',
    component: TabbedShellComponent,
    children: [
      { path: 'financial-advisor-summary', component: FinancialAdvisorSummaryPageComponent },
      // { path: 'monthly-trend', component: MonthlyTrendPageComponent },
      // { path: 'insurance-carrier-breakdown', component: InsuranceCarrierBreakdownPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'financial-advisor-summary' },
    ],
  },
];
```

---

## Component Architecture (Thin Components)

### Rule (Strict)
- **Pages are container components**:
  - dispatch NgRX actions
  - select view models from store (via selectors)
  - pass data down to presentational components
- **Presentational components**:
  - mostly `@Input()` / `@Output()`
  - no direct API calls
  - no direct store mutation (ideally no store access at all)

### Example: Page Component (Dispatch + Select Only)
```ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { FinancialAdvisorSummaryActions } from '../State/financial-advisor-summary.actions';
import { selectFinancialAdvisorSummaryVm } from '../State/financial-advisor-summary.selectors';

@Component({
  standalone: true,
  selector: 'app-financial-advisor-summary-page',
  templateUrl: './financial-advisor-summary-page.component.html',
  styleUrl: './financial-advisor-summary-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialAdvisorSummaryPageComponent {
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectFinancialAdvisorSummaryVm);

  ngOnInit(): void {
    this.store.dispatch(FinancialAdvisorSummaryActions.loadRequested());
  }
}
```

---

## NgRX Rules (Store + Effects)

### 1) File Naming Convention (Required)
Use NgRX “feature” style files inside each use-case `State/` folder:

- `financial-advisor-summary.actions.ts`
- `financial-advisor-summary.reducer.ts`
- `financial-advisor-summary.selectors.ts`
- `financial-advisor-summary.effects.ts`

### 2) Reducers
- Must be **pure functions**
- State must be **serializable**
- Keep state **simple** and **UI-friendly** (no classes, no Dates unless serialized, no functions)

### 3) Entities / Collections
- **Do NOT use `@ngrx/entity`** (preference).
- Use plain arrays/objects.

### 4) Loading/Error Pattern
- Use simple flags per feature:
  - `isLoading: boolean`
  - `error: string | null`

### 5) API Calls
- **Effects call generated API services directly** from `src/app/core/api/generated/`.
- Components do not call HTTP.

### 6) Mapping Policy
- **Effects** map **DTOs → State model**
- **Selectors** map **State → View model (VM)**

---

## NgRX Code Templates (Copy/Paste Friendly)

### Actions
```ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const FinancialAdvisorSummaryActions = createActionGroup({
  source: 'FinancialAdvisorSummary',
  events: {
    'Load Requested': emptyProps(),
    'Load Succeeded': props<{ items: ReadonlyArray<FinancialAdvisorRow> }>(),
    'Load Failed': props<{ error: string }>(),
  },
});

// Example state model (serializable, UI-friendly)
export type FinancialAdvisorRow = {
  advisorId: string;
  advisorName: string;
  // add only what the UI needs
};
```

### Reducer
```ts
import { createReducer, on } from '@ngrx/store';
import { FinancialAdvisorSummaryActions, FinancialAdvisorRow } from './financial-advisor-summary.actions';

export type FinancialAdvisorSummaryState = {
  items: ReadonlyArray<FinancialAdvisorRow>;
  isLoading: boolean;
  error: string | null;
};

export const initialState: FinancialAdvisorSummaryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const financialAdvisorSummaryReducer = createReducer(
  initialState,
  on(FinancialAdvisorSummaryActions.loadRequested, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(FinancialAdvisorSummaryActions.loadSucceeded, (state, { items }) => ({
    ...state,
    items,
    isLoading: false,
  })),
  on(FinancialAdvisorSummaryActions.loadFailed, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
);
```

### Selectors (State → View Model)
```ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FinancialAdvisorSummaryState } from './financial-advisor-summary.reducer';

export const selectFinancialAdvisorSummaryState =
  createFeatureSelector<FinancialAdvisorSummaryState>('financialAdvisorSummary');

export const selectFinancialAdvisorSummaryVm = createSelector(
  selectFinancialAdvisorSummaryState,
  (state) => ({
    rows: state.items,
    isLoading: state.isLoading,
    error: state.error,
  }),
);
```

### Effects (Call Generated SDK + Map DTO → State)
```ts
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { FinancialAdvisorSummaryActions } from './financial-advisor-summary.actions';

// Example: import the generated API client (adjust name/path to match actual generated output)
import { FinancialAdvisorSummaryApi } from '../../../core/api/generated/api';

export class FinancialAdvisorSummaryEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(FinancialAdvisorSummaryApi);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinancialAdvisorSummaryActions.loadRequested),
      switchMap(() =>
        this.api.getFinancialAdvisorSummary().pipe(
          map((dto) => {
            // DTO -> State mapping happens here
            const items = dto.items.map((x) => ({
              advisorId: x.advisorId,
              advisorName: x.advisorName,
            }));
            return FinancialAdvisorSummaryActions.loadSucceeded({ items });
          }),
          catchError((err) =>
            of(
              FinancialAdvisorSummaryActions.loadFailed({
                error: err?.message ?? 'Unknown error',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
```

> **Note:** `getFinancialAdvisorSummary()` is an example name. Use the actual method names from the generated SDK.

---

## Kendo UI Rules

- Use Kendo UI components directly in feature components.
- Create small wrapper components **only when reuse is proven (2+ uses)**.
- Shared Kendo defaults/helpers belong in:
  - `src/app/core/shared/kendo/`

---

## State Boundaries (NgRX vs Local State)

Use NgRX when state is:
- shared between components/pages
- relevant across tabs
- drives data fetching/caching
- derived from routing/URL

Use local component state when:
- purely ephemeral UI (e.g., local toggle, temporary input state that doesn’t need to persist)

---

## Less Styling Rules

- Prefer **component-scoped** `.less` files only.
- Avoid global styles except for absolute necessities.

---

## Shared Code Guardrails (Very Important)

### Do NOT create huge shared junk folders
- No “god” folders like `shared/components/mega/` or dumping everything into `shared/`.
- Shared code must be:
  - small
  - clearly reusable
  - stable
  - used by at least **2** features (unless it’s obviously core infrastructure)

### Where shared things go (Only if truly shared)
- Presentational UI components: `src/app/core/shared/ui/`
- Kendo config/helpers: `src/app/core/shared/kendo/`
- Utilities (pure functions only): `src/app/core/shared/utils/`

If something is only used by one use case, keep it inside that feature folder.

---

## Testing Expectations

- Unit tests are expected for:
  - reducers
  - selectors
  - effects (at least happy path + error path)
  - basic component tests for page components (smoke + dispatch on init)

---

## When in Doubt

1) Prefer feature-local code over shared code.  
2) Keep components thin: **dispatch + select**.  
3) Put HTTP only in **Effects**, using generated SDK.  
4) Map DTO → State in Effects; State → VM in Selectors.  
5) Keep state serializable and simple.
