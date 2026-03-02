import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, map, of, switchMap, take } from 'rxjs';
import { ReportsService } from '../../../core/api/generated';
import { FinancialAdvisorSummaryActions, FinancialAdvisorRow } from './financial-advisor-summary.actions';
import { selectFinancialAdvisorSummaryState } from './financial-advisor-summary.selectors';

@Injectable({ providedIn: 'root' })
export class FinancialAdvisorSummaryEffects {
  private readonly actions$ = inject(Actions);
  private readonly reportsService = inject(ReportsService);
  private readonly store = inject(Store);
  private readonly defaultRangeMaxOffset = 11;

  readonly reloadFinancialAdvisorSummaryOnDateRangeChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinancialAdvisorSummaryActions.dateRangeChanged),
      // Debounce slider scrubbing so we only reload after the user pauses.
      debounceTime(500),
      map(() => FinancialAdvisorSummaryActions.loadRequested()),
    ),
  );

  readonly loadFinancialAdvisorSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinancialAdvisorSummaryActions.loadRequested),
      // Snapshot current state once so request parameters match the moment of load.
      switchMap(() =>
        this.store.select(selectFinancialAdvisorSummaryState).pipe(
          take(1),
          switchMap((state) => {
            const { startDate, endDate } = this.toRequestDateRange(
              state.minStartDate,
              state.selectedDateRange,
            );

            return this.reportsService.getFinancialAdvisorSummary(startDate, endDate).pipe(
              map((response) =>
                FinancialAdvisorSummaryActions.loadSucceeded({
                  minStartDate: response.minStartDate,
                  maxEndDate: response.maxEndDate,
                  // Map DTO fields to the feature's UI-friendly state shape.
                  items: response.agentSummaries.map(
                    (agent): FinancialAdvisorRow => ({
                      agentId: agent.agentId,
                      agentName: agent.agentName,
                      averageMonthlyCommission: agent.averageMonthlyCommission,
                      totalCommission: agent.totalCommission,
                      averageMonthlyStatementVolume: agent.averageMonthlyStatementVolume,
                      statementVolume: agent.statementVolume,
                      bestYearMonth: agent.bestYearMonth,
                      topCarrierId: agent.topCarrier.carrierId,
                      topCarrierName: agent.topCarrier.carrierName,
                    }),
                  ),
                }),
              ),
              catchError((error: unknown) =>
                of(
                  FinancialAdvisorSummaryActions.loadFailed({
                    error: this.toErrorMessage(error),
                  }),
                ),
              ),
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
    // Convert slider offsets into real month boundary dates for the API contract.
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

    return 'Failed to load financial advisor summary.';
  }
}