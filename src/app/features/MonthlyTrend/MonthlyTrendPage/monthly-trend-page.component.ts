import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { DateRangeSliderComponent } from '../../../core/shared/components/DateRangeSlider/date-range-slider.component';
import { SharedDropdownComponent } from '../../../core/shared/components/SharedDropdown/shared-dropdown.component';
import { FiltersActions } from '../../../core/state/filters/filters.action';
import {
  selectAgentFilterOptions,
  selectSelectedAgentIdByPage,
} from '../../../core/state/filters/filters.selectors';
import { MonthlyTrendBarChartComponent } from '../Components/monthly-trend-bar-chart.component';
import { MonthlyTrendActions } from '../State/monthly-trend.actions';
import { selectMonthlyTrendVm } from '../State/monthly-trend.selectors';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-monthly-trend-page',
  standalone: true,
  imports: [AsyncPipe, DateRangeSliderComponent, SharedDropdownComponent, MonthlyTrendBarChartComponent],
  templateUrl: './monthly-trend-page.component.html',
  styleUrl: './monthly-trend-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyTrendPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fallbackSliderMin = 0;
  private readonly monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  });
  private readonly defaultMaxDate = new Date();
  private readonly defaultMinMonth = new Date(
    this.defaultMaxDate.getFullYear(),
    this.defaultMaxDate.getMonth() - 12,
    1,
  );
  private readonly fallbackSliderMax = 11;
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

  readonly agentOptions$ = this.store.select(selectAgentFilterOptions);
  readonly selectedAgentId$ = this.store.select(selectSelectedAgentIdByPage('monthlyTrend'));

  readonly vm$ = this.store.select(selectMonthlyTrendVm);
  readonly sliderMin$ = this.vm$.pipe(map(() => this.fallbackSliderMin));
  readonly sliderMax$ = this.vm$.pipe(
    map((vm) => this.toMonthIndexMax(vm.minStartDate, vm.maxEndDate, this.fallbackSliderMax)),
  );
  readonly sliderTickTitle$ = this.vm$.pipe(
    map((vm) => this.toMonthTickTitle(vm.minStartDate)),
  );

  ngOnInit(): void {
    this.store.dispatch(FiltersActions.loadAllAgentsRequested());

    // Sync local slider state whenever feature bounds change in the store.
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

  ngOnDestroy(): void {
    this.store.dispatch(
      FiltersActions.agentSelected({ pageKey: 'monthlyTrend', selectedAgentId: null }),
    );
  }

  onAgentSelected(value: unknown): void {
    // Dropdown values can arrive as number or string, so normalize before dispatching.
    const selectedAgentId =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim().length > 0
          ? Number(value)
          : null;

    this.store.dispatch(
      FiltersActions.agentSelected({
        pageKey: 'monthlyTrend',
        selectedAgentId:
          typeof selectedAgentId === 'number' && Number.isFinite(selectedAgentId)
            ? selectedAgentId
            : null,
      }),
    );
  }

  onDateRangeSelected(value: [number, number]): void {
    const nextRange: [number, number] = [Math.round(value[0]), Math.round(value[1])];
    this.dateRange = nextRange;
    this.store.dispatch(MonthlyTrendActions.dateRangeChanged({ range: nextRange }));
  }

  private toMonthIndexMax(
    minStartDate: string | null,
    maxEndDate: string | null,
    fallback: number,
  ): number {
    // Translate min/max month dates into slider index space.
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
