import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartsModule } from '@progress/kendo-angular-charts';

type InsuranceCarrierPieRow = {
  carrierName: string;
  agentCarrierTotalCommissionCents: number;
  agentCarrierRelativeWeightPct: number;
};

type PiePoint = {
  category: string;
  value: number;
  percent: number;
};

@Component({
  selector: 'app-insurance-carrier-pie-chart',
  imports: [ChartsModule],
  templateUrl: './insurance-carrier-pie-chart.component.html',
  styleUrl: './insurance-carrier-pie-chart.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsuranceCarrierPieChartComponent {
  private _rows: ReadonlyArray<InsuranceCarrierPieRow> = [];
  zeroPercentCategories: string[] = [];

  @Input()
  set rows(value: ReadonlyArray<InsuranceCarrierPieRow>) {
    const nextRows = value ?? [];
    this._rows = nextRows;
    // Track zero-weight slices so the template can explain why they may be hidden in labels.
    this.zeroPercentCategories = nextRows
      .filter((item) => item.agentCarrierRelativeWeightPct <= 0)
      .map((item) => item.carrierName);

    // Kendo pie expects display-ready values (dollars + percentage) per point.
    this.pieData = nextRows.map((item): PiePoint => ({
      category: item.carrierName,
      value: item.agentCarrierTotalCommissionCents / 100,
      percent: item.agentCarrierRelativeWeightPct,
    }));
  }

  get rows(): ReadonlyArray<InsuranceCarrierPieRow> {
    return this._rows;
  }

  pieData: PiePoint[] = [];

  private readonly chartLabelFont =
    "12px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  readonly chartArea = {
    background: 'transparent',
    margin: { top: 20, right: 56, bottom: 20, left: 56 },
  };

  readonly legend = {
    visible: true,
    position: 'bottom' as const,
    labels: {
      color: 'var(--kendo-color-subtle)',
      font: this.chartLabelFont,
    },
  };

  readonly tooltip = {
    visible: true,
    format: 'c2',
    font: this.chartLabelFont,
  };

  readonly seriesLabels = {
    visible: true,
    position: 'outsideEnd' as const,
    background: 'transparent',
    color: 'var(--kendo-color-subtle)',
    font: this.chartLabelFont,
    content: (args: { category: string; dataItem?: PiePoint }): string => {
      const pct = args.dataItem?.percent;
      if (typeof pct !== 'number') {
        return args.category;
      }

      if (pct <= 0) {
        return '';
      }

      return typeof pct === 'number'
        ? `${args.category} (${pct.toFixed(1)}%)`
        : args.category;
    },
  };
}
