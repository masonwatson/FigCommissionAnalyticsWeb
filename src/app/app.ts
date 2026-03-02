import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
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

  protected readonly title = signal('fig-commission-analytics');
  protected readonly pendingApiBaseUrl = signal(this.apiBaseUrlService.inputValue());
  protected readonly isApiBaseUrlSubmitted = signal(false);
  protected readonly submittedApiBaseUrl = computed(() => this.apiBaseUrlService.inputValue());
  protected readonly canSubmitApiBaseUrl = computed(() => this.pendingApiBaseUrl().trim().length > 0);
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
    if (this.isCheckingHealth()) {
      return false;
    }

    const status = this.healthStatus();
    if (status !== null) {
      return status !== 'Healthy';
    }

    return this.healthError() !== null;
  });

  constructor() {
    this.store.dispatch(AppActions.healthCheckRequested({ useFallbackBaseUrl: true }));

    const savedInput = this.savedApiBaseUrlInput();
    if (savedInput) {
      this.pendingApiBaseUrl.set(savedInput);
    }

    effect(() => {
      if (this.healthStatus() === 'Healthy') {
        this.apiBaseUrlService.setFallbackAsPrimaryBaseUrl();
      }
    });
  }

  protected onApiBaseUrlInput(value: string): void {
    this.pendingApiBaseUrl.set(value);
  }

  protected onApiBaseUrlSubmit(event: Event): void {
    event.preventDefault();
    const value = this.pendingApiBaseUrl().trim();
    if (!value) {
      return;
    }

    this.apiBaseUrlService.setBaseUrlInput(value);
    this.pendingApiBaseUrl.set(value);
    this.store.dispatch(AppActions.apiBaseUrlInputChanged({ value }));
    this.isApiBaseUrlSubmitted.set(true);
    this.dispatchActiveTabLoadRequested();
  }

  protected onApiBaseUrlEdit(): void {
    this.pendingApiBaseUrl.set(this.apiBaseUrlService.inputValue());
    this.isApiBaseUrlSubmitted.set(false);
  }

  private dispatchActiveTabLoadRequested(): void {
    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/monthly-trend')) {
      this.store.dispatch(MonthlyTrendActions.loadRequested());
      return;
    }

    if (currentUrl.startsWith('/insurance-carrier-breakdown')) {
      this.store.dispatch(InsuranceCarrierBreakdownActions.loadRequested());
      return;
    }

    this.store.dispatch(FinancialAdvisorSummaryActions.loadRequested());
  }
}
