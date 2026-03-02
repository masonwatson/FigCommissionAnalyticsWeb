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
import { Configuration } from './core/api/generated/configuration';
import { filtersReducer } from './core/state/filters/filters.recucer';
import { FiltersEffects } from './core/state/filters/filters.effects';
import { ApiBaseUrlService } from './core/api/api-base-url.service';
import { appReducer } from './core/state/app/app.reducer';
import { AppEffects } from './core/state/app/app.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    {
      provide: Configuration,
      useFactory: (apiBaseUrlService: ApiBaseUrlService) => apiBaseUrlService.configuration,
      deps: [ApiBaseUrlService],
    },
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
    provideState('app', appReducer),
    provideEffects([FinancialAdvisorSummaryEffects]),
    provideEffects([MonthlyTrendEffects]),
    provideEffects([InsuranceCarrierBreakdownEffects]),
    provideEffects([FiltersEffects]),
    provideEffects([AppEffects]),
]
};
