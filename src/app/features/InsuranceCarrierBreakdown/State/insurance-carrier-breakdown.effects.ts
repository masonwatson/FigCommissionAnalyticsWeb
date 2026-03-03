import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, combineLatest, debounceTime, filter, map, of, switchMap, take } from 'rxjs';
import { ReportsService } from '../../../core/api/generated';
import { FiltersActions } from '../../../core/state/filters/filters.action';
import { selectSelectedAgentIdByPage } from '../../../core/state/filters/filters.selectors';
import {
  InsuranceCarrierBreakdownActions,
  InsuranceCarrierRow,
} from './insurance-carrier-breakdown.actions';
import { selectInsuranceCarrierBreakdownState } from './insurance-carrier-breakdown.selectors';

@Injectable({ providedIn: 'root' })
export class InsuranceCarrierBreakdownEffects {
  private readonly actions$ = inject(Actions);
  private readonly reportsService = inject(ReportsService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly defaultRangeMaxOffset = 11;

  readonly reloadInsuranceCarrierBreakdownOnAgentSelected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FiltersActions.agentSelected),
      filter(({ pageKey }) => pageKey === 'insuranceCarrierBreakdown'),
      // Only react when this route is visible to avoid unnecessary API calls.
      filter(() => this.router.url.startsWith('/insurance-carrier-breakdown')),
      map(() => InsuranceCarrierBreakdownActions.loadRequested()),
    ),
  );

  readonly reloadInsuranceCarrierBreakdownOnDateRangeChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InsuranceCarrierBreakdownActions.dateRangeChanged),
      debounceTime(500),
      filter(() => this.router.url.startsWith('/insurance-carrier-breakdown')),
      map(() => InsuranceCarrierBreakdownActions.loadRequested()),
    ),
  );

  readonly loadInsuranceCarrierBreakdown$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InsuranceCarrierBreakdownActions.loadRequested),
      switchMap(() =>
        // Snapshot selected agent + date-range state once and issue a single request.
        combineLatest([
          this.store.select(selectSelectedAgentIdByPage('insuranceCarrierBreakdown')),
          this.store.select(selectInsuranceCarrierBreakdownState),
        ]).pipe(
          take(1),
          switchMap(([selectedAgentId, state]) => {
            const { startDate, endDate } = this.toRequestDateRange(
              state.minStartDate,
              state.selectedDateRange,
            );

            return (
            this.reportsService
              .getInsuranceCarrierBreakdown(
                // API expects undefined for "all agents" instead of null/invalid IDs.
                selectedAgentId !== null && selectedAgentId > 0 ? selectedAgentId : undefined,
                startDate,
                endDate,
              )
              .pipe(
                map((response) => {
                  const items = response.agentCarrierBreakdowns
                    .map(
                      (item): InsuranceCarrierRow => ({
                        carrierId: item.carrierId,
                        carrierName: item.carrierName,
                        agentCarrierTotalCommissionCents: item.agentCarrierTotalCommission,
                        agentCarrierRelativeWeightPct: item.agentCarrierRelativeWeight * 100,
                      }),
                    )
                    .sort((left, right) => left.carrierId - right.carrierId);

                  return InsuranceCarrierBreakdownActions.loadSucceeded({
                    minStartDate: response.minStartDate,
                    maxEndDate: response.maxEndDate,
                    items,
                  });
                }),
                catchError((error: unknown) =>
                  of(
                    InsuranceCarrierBreakdownActions.loadFailed({
                      error: this.toErrorMessage(error),
                    }),
                  ),
                ),
              )
            );
          }),
        ),
      ),
    ),
  );

  private toRequestDateRange(
    minStartDate: string | null,
    selectedDateRange: [number, number] | null,
  ): { startDate: string | undefined; endDate: string | undefined } {
    // Translate slider offsets into first/last day boundaries for the month range.
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

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to load insurance carrier breakdown.';
  }
}
