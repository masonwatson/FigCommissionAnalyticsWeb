import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, combineLatest, debounceTime, filter, map, of, switchMap, take } from 'rxjs';
import { ReportsService } from '../../../core/api/generated';
import { FiltersActions } from '../../../core/state/filters/filters.action';
import { selectSelectedAgentIdByPage } from '../../../core/state/filters/filters.selectors';
import { MonthlyTrendActions, MonthlyTrendRow } from './monthly-trend.actions';
import { selectMonthlyTrendState } from './monthly-trend.selectors';

@Injectable({ providedIn: 'root' })
export class MonthlyTrendEffects {
  private readonly actions$ = inject(Actions);
  private readonly reportsService = inject(ReportsService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly defaultRangeMaxOffset = 11;

  readonly reloadMonthlyTrendOnAgentSelected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FiltersActions.agentSelected),
      filter(({ pageKey }) => pageKey === 'monthlyTrend'),
      filter(({ selectedAgentId }) => selectedAgentId !== null && selectedAgentId > 0),
      // Guard against cross-tab filter changes: only reload when this page is active.
      filter(() => this.router.url.startsWith('/monthly-trend')),
      map(() => MonthlyTrendActions.loadRequested()),
    ),
  );

  readonly reloadMonthlyTrendOnDateRangeChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MonthlyTrendActions.dateRangeChanged),
      debounceTime(500),
      filter(() => this.router.url.startsWith('/monthly-trend')),
      map(() => MonthlyTrendActions.loadRequested()),
    ),
  );

  readonly clearMonthlyTrendOnDefaultAgentSelected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FiltersActions.agentSelected),
      filter(({ pageKey }) => pageKey === 'monthlyTrend'),
      filter(({ selectedAgentId }) => selectedAgentId === null || selectedAgentId <= 0),
      map(() =>
        MonthlyTrendActions.loadSucceeded({
          items: [],
          minStartDate: null,
          maxEndDate: null,
        }),
      ),
    ),
  );

  readonly loadMonthlyTrend$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MonthlyTrendActions.loadRequested),
      switchMap(() =>
        // Read both agent selection and feature state once for a single request decision.
        combineLatest([
          this.store.select(selectSelectedAgentIdByPage('monthlyTrend')),
          this.store.select(selectMonthlyTrendState),
        ]).pipe(
          take(1),
          switchMap(([selectedAgentId, state]) =>
            // No agent selected means the chart should intentionally render empty data.
            selectedAgentId === null || selectedAgentId <= 0
              ? of(
                  MonthlyTrendActions.loadSucceeded({
                    items: [],
                    minStartDate: null,
                    maxEndDate: null,
                  }),
                )
              : (() => {
                  const { startDate, endDate } = this.toRequestDateRange(
                    state.minStartDate,
                    state.selectedDateRange,
                  );

                  return this.reportsService
                    .getMonthlyTrend(selectedAgentId, startDate, endDate)
                    .pipe(
                      map((response) =>
                        MonthlyTrendActions.loadSucceeded({
                          minStartDate: response.minStartDate,
                          maxEndDate: response.maxEndDate,
                          items: response.monthlyCommissions.map(
                            (item): MonthlyTrendRow => ({
                              monthLabel: item.yearMonth,
                              totalCommissionCents: item.totalCommission,
                            }),
                          ),
                        }),
                      ),
                      catchError((err: { message?: string } | null | undefined) =>
                        of(
                          MonthlyTrendActions.loadFailed({
                            error: err?.message ?? 'Unknown error',
                          }),
                        ),
                      ),
                    );
                })(),
          ),
        ),
      ),
    ),
  );

  private toRequestDateRange(
    minStartDate: string | null,
    selectedDateRange: [number, number] | null,
  ): { startDate: string | undefined; endDate: string | undefined } {
    // Normalize the slider range so API receives an ordered month window.
    const baseMonth = this.toMonthStart(minStartDate) ?? this.getDefaultBaseMonth();
    const [rawStartOffset, rawEndOffset] = selectedDateRange ?? [0, this.defaultRangeMaxOffset];
    const startOffset = Math.min(rawStartOffset, rawEndOffset);
    const endOffset = Math.max(rawStartOffset, rawEndOffset);

    const startMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + startOffset, 1);
    const endMonth =
      startOffset === endOffset
        ? new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 0)
        : new Date(baseMonth.getFullYear(), baseMonth.getMonth() + endOffset + 1, 0);

    return {
      startDate: this.toIsoDate(startMonth),
      endDate: this.toIsoDate(endMonth),
    };
  }

  private toMonthStart(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }

  private getDefaultBaseMonth(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 12, 1);
  }

  private toIsoDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}