import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { HealthService } from '../../api/health.service';
import { AppActions } from './app.actions';
import { FinancialAdvisorSummaryActions } from '../../../features/FinancialAdvisorSummary/State/financial-advisor-summary.actions';
import { MonthlyTrendActions } from '../../../features/MonthlyTrend/State/monthly-trend.actions';
import { InsuranceCarrierBreakdownActions } from '../../../features/InsuranceCarrierBreakdown/State/insurance-carrier-breakdown.actions';
import { FiltersActions } from '../filters/filters.action';

@Injectable({ providedIn: 'root' })
export class AppEffects {
  private readonly actions$ = inject(Actions);
  private readonly healthService = inject(HealthService);

  readonly healthCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.healthCheckRequested),
      switchMap(({ useFallbackBaseUrl }) =>
        this.healthService.getHealth('body', false, { useFallbackBaseUrl }).pipe(
          map((response) =>
            AppActions.healthCheckSucceeded({
              status: response.status,
            }),
          ),
          catchError((error: unknown) =>
            of(
              AppActions.healthCheckFailed({
                error: this.toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly clearApiDataOnHealthCheckFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.healthCheckFailed),
      switchMap(() =>
        of(
          FinancialAdvisorSummaryActions.resetRequested(),
          MonthlyTrendActions.resetRequested(),
          InsuranceCarrierBreakdownActions.resetRequested(),
          FiltersActions.resetRequested(),
        ),
      ),
    ),
  );

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed health check.';
  }
}
