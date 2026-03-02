import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { FinancialAdvisorRow } from '../State/financial-advisor-summary.actions';

@Component({
  selector: 'app-financial-advisor-summary-grid',
  standalone: true,
  imports: [GridModule, CurrencyPipe],
  templateUrl: './financial-advisor-grid.component.html',
  styleUrl: './financial-advisor-grid.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialAdvisorSummaryGridComponent {
  private _rows: ReadonlyArray<FinancialAdvisorRow> = [];

  @Input()
  set rows(value: ReadonlyArray<FinancialAdvisorRow>) {
    this._rows = value ?? [];
    this.rebuildGridRows();
  }

  get rows(): ReadonlyArray<FinancialAdvisorRow> {
    return this._rows;
  }

  protected sort: SortDescriptor[] = [];
  protected gridRows: Array<FinancialAdvisorRow> = [];
  private readonly monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  });

  protected onSortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.rebuildGridRows();
  }

  protected formatBestYearMonth(value: string): string {
    // Keep raw API value when parsing fails so the grid still shows something meaningful.
    const parsed = this.toBestYearMonthDate(value);
    if (!parsed) {
      return value;
    }

    return this.monthYearFormatter.format(parsed);
  }

  private toBestYearMonthSortValue(value: unknown): number {
    if (typeof value !== 'string') {
      return Number.MIN_SAFE_INTEGER;
    }

    const parsed = this.toBestYearMonthDate(value);
    return parsed ? parsed.getTime() : Number.MIN_SAFE_INTEGER;
  }

  private toBestYearMonthDate(value: string): Date | null {
    const yearMonthMatch = /^(\d{4})-(\d{2})$/.exec(value.trim());
    if (yearMonthMatch) {
      const year = Number(yearMonthMatch[1]);
      const month = Number(yearMonthMatch[2]);
      if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }

  private rebuildGridRows(): void {
    // Always clone input rows so sorting never mutates parent state.
    const rows = [...this.rows];

    if (this.sort.length === 0) {
      this.gridRows = rows;
      return;
    }

    const [firstSort] = this.sort;
    if (firstSort?.field === 'bestYearMonth' && firstSort.dir) {
      // Custom sort handles YYYY-MM and ISO-like values consistently as month timestamps.
      const direction = firstSort.dir === 'asc' ? 1 : -1;
      this.gridRows = rows.sort(
        (left, right) =>
          direction *
          (this.toBestYearMonthSortValue(left.bestYearMonth) -
            this.toBestYearMonthSortValue(right.bestYearMonth)),
      );
      return;
    }

    this.gridRows = orderBy(rows, this.sort);
  }
}