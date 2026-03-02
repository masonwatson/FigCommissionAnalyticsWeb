import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideEffects } from '@ngrx/effects';
import { FinancialAdvisorSummaryEffects } from './features/FinancialAdvisorSummary/State/financial-advisor-summary.effects';
import { financialAdvisorSummaryReducer } from './features/FinancialAdvisorSummary/State/financial-advisor-summary.reducer';
import { MonthlyTrendEffects } from './features/MonthlyTrend/State/monthly-trend.effects';
import { monthlyTrendReducer } from './features/MonthlyTrend/State/monthly-trend.reducer';
import { InsuranceCarrierBreakdownEffects } from './features/InsuranceCarrierBreakdown/State/insurance-carrier-breakdown.effects';
import { insuranceCarrierBreakdownReducer } from './features/InsuranceCarrierBreakdown/State/insurance-carrier-breakdown.reducer';
import { provideStore } from '@ngrx/store';
import { provideState } from '@ngrx/store';
import { provideApi } from './core/api/generated/provide-api';
import { filtersReducer } from './core/state/filters/filters.recucer';
import { FiltersEffects } from './core/state/filters/filters.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideApi('/api/v1'),
    provideStore(),
	provideStoreDevtools({
      maxAge: 50,
      logOnly: !isDevMode(), // read-only in prod
      autoPause: true,
      trace: false,
    }),
    provideState('financialAdvisorSummary', financialAdvisorSummaryReducer),
    provideState('monthlyTrend', monthlyTrendReducer),
    provideState('insuranceCarrierBreakdown', insuranceCarrierBreakdownReducer),
    provideState('filters', filtersReducer),
    provideEffects([FinancialAdvisorSummaryEffects]),
    provideEffects([MonthlyTrendEffects]),
    provideEffects([InsuranceCarrierBreakdownEffects]),
    provideEffects([FiltersEffects])
]
};
