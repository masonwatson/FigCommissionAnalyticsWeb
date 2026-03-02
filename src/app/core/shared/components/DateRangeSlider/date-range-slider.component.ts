import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { InputsModule } from '@progress/kendo-angular-inputs';

@Component({
  selector: 'app-date-range-slider',
  standalone: true,
  imports: [InputsModule],
  templateUrl: './date-range-slider.component.html',
  styleUrl: './date-range-slider.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeSliderComponent {
  private readonly fallbackTickTitle = (value: number): string => `${value}`;

  readonly min = input(0);
  readonly max = input(100);
  readonly smallStep = input(1);
  readonly largeStep = input(10);
  readonly value = input<[number, number]>([0, 100]);
  readonly tickTitle = input<((value: number) => string) | null>(null);

  readonly effectiveSmallStep = computed(() => {
    const min = this.min();
    const max = this.max();
    const configuredSmallStep = this.smallStep();
    const range = max - min;

    if (!Number.isFinite(range) || range <= 0 || range <= 1000) {
      return configuredSmallStep;
    }

    const maxTickCount = 500;
    const rangeBasedStep = Math.ceil(range / maxTickCount);
    return Math.max(configuredSmallStep, rangeBasedStep);
  });

  readonly effectiveLargeStep = computed(() => this.resolveLargeStep());

  readonly effectiveTickTitle = computed<(value: number) => string>(
    () => this.tickTitle() ?? this.fallbackTickTitle,
  );

  readonly valueSelected = output<[number, number]>();

  onValueChange(nextValue: [number, number]): void {
    this.valueSelected.emit(nextValue);
  }

  private resolveLargeStep(): number {
    const min = this.min();
    const max = this.max();
    const configuredLargeStep = this.largeStep();
    const range = max - min;

    if (!Number.isFinite(range) || range <= 0 || range <= 1000) {
      return configuredLargeStep;
    }

    return Math.max(configuredLargeStep, this.effectiveSmallStep() * 10);
  }
}
