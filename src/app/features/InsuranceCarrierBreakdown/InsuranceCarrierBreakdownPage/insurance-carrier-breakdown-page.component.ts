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
import { InsuranceCarrierPieChartComponent } from '../Components/insurance-carrier-pie-chart.component';
import { InsuranceCarrierBreakdownActions } from '../State/insurance-carrier-breakdown.actions';
import { selectInsuranceCarrierBreakdownVm } from '../State/insurance-carrier-breakdown.selectors';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-insurance-carrier-breakdown-page',
  imports: [AsyncPipe, DateRangeSliderComponent, SharedDropdownComponent, InsuranceCarrierPieChartComponent],
  templateUrl: './insurance-carrier-breakdown-page.component.html',
  styleUrl: './insurance-carrier-breakdown-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsuranceCarrierBreakdownPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fallbackSliderMin = 0;
  private readonly fallbackSliderMax = 11;
  readonly defaultTickTitle = (value: number): string => `${Math.round(value)}`;
  private readonly monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  });

  dateRange: [number, number] = [0, 11];

  readonly agentOptions$ = this.store.select(selectAgentFilterOptions);
  readonly selectedAgentId$ = this.store.select(
    selectSelectedAgentIdByPage('insuranceCarrierBreakdown'),
  );

  readonly vm$ = this.store.select(selectInsuranceCarrierBreakdownVm);
  readonly sliderMin$ = this.vm$.pipe(map(() => this.fallbackSliderMin));
  readonly sliderMax$ = this.vm$.pipe(
    map((vm) => this.toMonthIndexMax(vm.minStartDate, vm.maxEndDate, this.fallbackSliderMax)),
  );
  readonly sliderTickTitle$ = this.vm$.pipe(
    map((vm) => this.toMonthTickTitle(vm.minStartDate)),
  );

  ngOnInit(): void {
    this.store.dispatch(FiltersActions.loadAllAgentsRequested());
    this.store.dispatch(InsuranceCarrierBreakdownActions.loadRequested());

    // Keep local slider values in sync with VM-derived bounds from the latest API response.
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
      FiltersActions.agentSelected({ pageKey: 'insuranceCarrierBreakdown', selectedAgentId: null }),
    );
  }

  onAgentSelected(value: unknown): void {
    // Normalize flexible dropdown payloads to a safe numeric agent ID or null.
    const selectedAgentId =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim().length > 0
          ? Number(value)
          : null;

    this.store.dispatch(
      FiltersActions.agentSelected({
        pageKey: 'insuranceCarrierBreakdown',
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
    this.store.dispatch(InsuranceCarrierBreakdownActions.dateRangeChanged({ range: nextRange }));
  }

  private toMonthIndexMax(
    minStartDate: string | null,
    maxEndDate: string | null,
    fallback: number,
  ): number {
    // Slider max equals the number of whole month steps between min and max bounds.
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
