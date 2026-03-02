import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { DateRangeSliderComponent } from '../../../core/shared/components/DateRangeSlider/date-range-slider.component';
import { FinancialAdvisorSummaryActions } from '../State/financial-advisor-summary.actions';
import { selectFinancialAdvisorSummaryVm } from '../State/financial-advisor-summary.selectors';
import { FinancialAdvisorSummaryGridComponent } from '../Components/financial-advisor-grid.component';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-financial-advisor-summary-page',
  standalone: true,
  imports: [AsyncPipe, DateRangeSliderComponent, FinancialAdvisorSummaryGridComponent],
  templateUrl: './financial-advisor-summary-page.component.html',
  styleUrl: './financial-advisor-summary-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialAdvisorSummaryPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fallbackSliderMin = 0;
  private readonly fallbackSliderMax = 11;
  private readonly monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  });
  private readonly defaultMaxDate = new Date();
  private readonly defaultMinMonth = new Date(
    this.defaultMaxDate.getFullYear(),
    this.defaultMaxDate.getMonth() - 11,
    1,
  );

  readonly defaultTickTitle = (value: number): string => {
    const monthOffset = Math.max(0, Math.round(value));
    const tickDate = new Date(
      this.defaultMinMonth.getFullYear(),
      this.defaultMinMonth.getMonth() + monthOffset,
      1,
    );
    return this.monthYearFormatter.format(tickDate);
  };

  dateRange: [number, number] = [0, 11];

  readonly vm$ = this.store.select(selectFinancialAdvisorSummaryVm);
  readonly sliderMin$ = this.vm$.pipe(map(() => this.fallbackSliderMin));
  readonly sliderMax$ = this.vm$.pipe(
    map((vm) => this.toMonthIndexMax(vm.minStartDate, vm.maxEndDate, this.fallbackSliderMax)),
  );
  readonly sliderTickTitle$ = this.vm$.pipe(
    map((vm) => this.toMonthTickTitle(vm.minStartDate)),
  );

  ngOnInit(): void {
    this.store.dispatch(FinancialAdvisorSummaryActions.loadRequested());

    // Keep local slider range aligned with server-driven bounds from the view model.
    combineLatest([this.sliderMin$, this.sliderMax$])
      .pipe(
        distinctUntilChanged(
          ([previousMin, previousMax], [nextMin, nextMax]) =>
            previousMin === nextMin && previousMax === nextMax,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([min, max]) => {
        if (min <= max) {
          this.dateRange = [min, max];
        }
      });
  }

  onDateRangeSelected(value: [number, number]): void {
    const nextRange: [number, number] = [Math.round(value[0]), Math.round(value[1])];
    this.dateRange = nextRange;
    this.store.dispatch(FinancialAdvisorSummaryActions.dateRangeChanged({ range: nextRange }));
  }

  private toMonthIndexMax(
    minStartDate: string | null,
    maxEndDate: string | null,
    fallback: number,
  ): number {
    // Convert month dates into a slider max index (number of months from min to max).
    const minMonth = this.toMonthDate(minStartDate);
    const maxMonth = this.toMonthDate(maxEndDate);

    if (!minMonth || !maxMonth || maxMonth < minMonth) {
      return fallback;
    }

    return (maxMonth.getFullYear() - minMonth.getFullYear()) * 12 +
      (maxMonth.getMonth() - minMonth.getMonth());
  }

  private toMonthDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }

  private toMonthTickTitle(minStartDate: string | null): (value: number) => string {
    const baseMonth = this.toMonthDate(minStartDate);

    // Fall back to a reasonable local 12-month window until API date bounds are available.
    if (!baseMonth) {
      return this.defaultTickTitle;
    }

    return (value: number) => {
      const monthOffset = Math.max(0, Math.round(value));
      const tickDate = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + monthOffset, 1);
      return this.monthYearFormatter.format(tickDate);
    };
  }
}