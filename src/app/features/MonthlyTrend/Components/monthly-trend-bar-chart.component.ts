import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartsModule } from '@progress/kendo-angular-charts';

@Component({
  selector: 'app-monthly-trend-bar-chart',
  imports: [ChartsModule],
  templateUrl: './monthly-trend-bar-chart.component.html',
  styleUrl: './monthly-trend-bar-chart.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyTrendBarChartComponent {
  private _rows: ReadonlyArray<{ monthLabel: string; totalCommissionCents: number }> = [];
  private readonly emptyCategory = ' ';
  private readonly monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  });
  isEmptyState = true;

  @Input()
  set rows(value: ReadonlyArray<{ monthLabel: string; totalCommissionCents: number }>) {
    const nextRows = value ?? [];
    this._rows = nextRows;

    if (nextRows.length === 0) {
      // Render a hidden placeholder bar so the chart frame stays stable in empty state.
      this.categories = [this.emptyCategory];
      this.values = [0];
      this.seriesColor = 'transparent';
      this.activeSeriesTooltip = this.hiddenSeriesTooltip;
      this.isEmptyState = true;
      return;
    }

    this.categories = nextRows.map((row) => this.toMonthYearLabel(row.monthLabel));
    this.values = nextRows.map((row) => row.totalCommissionCents / 100);
    this.seriesColor = 'var(--kendo-color-primary)';
    this.activeSeriesTooltip = this.seriesTooltip;
    this.isEmptyState = false;
  }

  get rows(): ReadonlyArray<{ monthLabel: string; totalCommissionCents: number }> {
    return this._rows;
  }

  categories: string[] = [];
  values: number[] = [];
  seriesColor = 'var(--kendo-color-primary)';

  private readonly chartLabelFont =
    "12px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  readonly chartArea = {
    background: 'transparent',
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
  };
      // Convert backend cents to dollars for Kendo currency formatting.

  readonly legend = {
    visible: false,
  };

  readonly categoryAxisLabels = {
    color: 'var(--kendo-color-subtle)',
    font: this.chartLabelFont,
  };

  readonly valueAxisLabels = {
    color: 'var(--kendo-color-subtle)',
    font: this.chartLabelFont,
    format: 'c0',
  };

  readonly hiddenGridLines = {
    visible: false,
  };

  readonly hiddenTicks = {
    visible: false,
  };

  readonly axisLine = {
    color: 'var(--kendo-color-border)',
  };

  readonly hiddenLine = {
    visible: false,
  };

  readonly valueGridLines = {
    color: 'var(--kendo-color-border)',
  };

  readonly seriesTooltip = {
    visible: true,
    format: 'c0',
    font: this.chartLabelFont,
  };

  readonly hiddenSeriesTooltip = {
    visible: false,
  };

  activeSeriesTooltip = this.hiddenSeriesTooltip;

  readonly seriesDefaults = {
    gap: 1.2,
    spacing: 0.4,
  };

  private toMonthYearLabel(value: string): string {
    // Prefer strict YYYY-MM parsing, then fall back to Date parsing for compatibility.
    const parsedYearMonth = /^(\d{4})-(\d{2})$/.exec(value.trim());
    if (parsedYearMonth) {
      const year = Number(parsedYearMonth[1]);
      const month = Number(parsedYearMonth[2]);

      if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
        return this.monthYearFormatter.format(new Date(year, month - 1, 1));
      }
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return this.monthYearFormatter.format(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }

    return value;
  }

}