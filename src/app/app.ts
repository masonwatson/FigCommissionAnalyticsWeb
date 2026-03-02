import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { ApiBaseUrlService } from './core/api/api-base-url.service';
import {
  selectApiBaseUrlInput,
  selectHealthError,
  selectHealthStatus,
  selectIsCheckingHealth,
} from './core/state/app/app.selectors';
import { AppActions } from './core/state/app/app.actions';
import { FinancialAdvisorSummaryActions } from './features/FinancialAdvisorSummary/State/financial-advisor-summary.actions';
import { MonthlyTrendActions } from './features/MonthlyTrend/State/monthly-trend.actions';
import { InsuranceCarrierBreakdownActions } from './features/InsuranceCarrierBreakdown/State/insurance-carrier-breakdown.actions';
import { HealthService } from './core/api/health.service';
import { FiltersActions } from './core/state/filters/filters.action';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  private readonly apiBaseUrlService = inject(ApiBaseUrlService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly healthService = inject(HealthService);
  private readonly startupHealthCheckTimedOut = signal(false);
  private readonly hasHandledHealthyStartup = signal(false);

  protected readonly title = signal('fig-commission-analytics');
  protected readonly pendingApiBaseUrl = signal(this.apiBaseUrlService.inputValue());
  protected readonly isApiBaseUrlSubmitted = signal(false);
  protected readonly submittedApiBaseUrl = computed(() => this.apiBaseUrlService.inputValue());
  protected readonly canSubmitApiBaseUrl = computed(() => this.pendingApiBaseUrl().trim().length > 0);
  protected readonly isSubmittingApiBaseUrl = signal(false);
  protected readonly apiBaseUrlSubmitError = signal<string | null>(null);
  private readonly healthStatus = toSignal(this.store.select(selectHealthStatus), { initialValue: null });
  private readonly healthError = toSignal(this.store.select(selectHealthError), { initialValue: null });
  private readonly isCheckingHealth = toSignal(this.store.select(selectIsCheckingHealth), {
    initialValue: false,
  });
  private readonly savedApiBaseUrlInput = toSignal(this.store.select(selectApiBaseUrlInput), {
    initialValue: '',
  });
  protected readonly isAppUnlocked = computed(
    () => this.isApiBaseUrlSubmitted() || this.healthStatus() === 'Healthy',
  );
  protected readonly shouldShowApiBaseUrlInput = computed(() => {
    if (this.isApiBaseUrlSubmitted()) {
      return true;
    }

    if (this.isCheckingHealth() && !this.startupHealthCheckTimedOut()) {
      return false;
    }

    return !this.isAppUnlocked();
  });

  constructor() {
    this.store.dispatch(AppActions.healthCheckRequested({ useFallbackBaseUrl: true }));
    window.setTimeout(() => {
      if (!this.isAppUnlocked()) {
        this.startupHealthCheckTimedOut.set(true);
      }
    }, 2500);

    const savedInput = this.savedApiBaseUrlInput();
    if (savedInput) {
      this.pendingApiBaseUrl.set(savedInput);
    }

    effect(() => {
      if (this.healthStatus() === 'Healthy' && !this.hasHandledHealthyStartup()) {
        this.apiBaseUrlService.setFallbackAsPrimaryBaseUrl();
        this.dispatchActiveTabLoadRequested();
        this.hasHandledHealthyStartup.set(true);
        this.startupHealthCheckTimedOut.set(false);
      }
    });

    effect(() => {
      if (this.healthError()) {
        this.hasHandledHealthyStartup.set(false);
        this.startupHealthCheckTimedOut.set(false);
      }
    });
  }

  protected onApiBaseUrlInput(value: string): void {
    this.pendingApiBaseUrl.set(value);
    this.apiBaseUrlSubmitError.set(null);
  }

  protected async onApiBaseUrlSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const value = this.pendingApiBaseUrl().trim();
    if (!value || this.isSubmittingApiBaseUrl()) {
      return;
    }

    this.isSubmittingApiBaseUrl.set(true);
    this.apiBaseUrlSubmitError.set(null);

    try {
      const response = await firstValueFrom(
        this.healthService.getHealth('body', false, { baseUrlInput: value }),
      );

      if (response.status !== 'Healthy') {
        this.store.dispatch(AppActions.healthCheckFailed({ error: 'Health check failed for this URL.' }));
        this.isApiBaseUrlSubmitted.set(false);
        this.apiBaseUrlSubmitError.set('Health check failed for this URL.');
        return;
      }

      this.apiBaseUrlService.setBaseUrlInput(value);
      this.pendingApiBaseUrl.set(value);
      this.store.dispatch(AppActions.apiBaseUrlInputChanged({ value }));
      this.isApiBaseUrlSubmitted.set(true);
      // Trigger tab load only after this entered URL passes health check.
      this.dispatchActiveTabLoadRequested();
    } catch {
      this.store.dispatch(AppActions.healthCheckFailed({ error: 'Health check failed for this URL.' }));
      this.isApiBaseUrlSubmitted.set(false);
      this.apiBaseUrlSubmitError.set('Health check failed for this URL.');
    } finally {
      this.isSubmittingApiBaseUrl.set(false);
    }
  }

  protected onApiBaseUrlEdit(): void {
    this.pendingApiBaseUrl.set(this.apiBaseUrlService.inputValue());
    this.isApiBaseUrlSubmitted.set(false);
  }

  private dispatchActiveTabLoadRequested(): void {
    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/monthly-trend')) {
      this.store.dispatch(FiltersActions.loadAllAgentsRequested());
      this.store.dispatch(MonthlyTrendActions.loadRequested());
      return;
    }

    if (currentUrl.startsWith('/insurance-carrier-breakdown')) {
      this.store.dispatch(FiltersActions.loadAllAgentsRequested());
      this.store.dispatch(InsuranceCarrierBreakdownActions.loadRequested());
      return;
    }

    this.store.dispatch(FinancialAdvisorSummaryActions.loadRequested());
  }
}
