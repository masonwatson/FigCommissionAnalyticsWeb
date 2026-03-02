import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type MonthlyTrendRow = {
  monthLabel: string;
  totalCommissionCents: number;
};

export const MonthlyTrendActions = createActionGroup({
  source: 'MonthlyTrend',
  events: {
    'Reset Requested': emptyProps(),
    'Load Requested': emptyProps(),
    'Date Range Changed': props<{ range: [number, number] }>(),
    'Date Range Cleared': emptyProps(),
    'Load Succeeded': props<{
      items: ReadonlyArray<MonthlyTrendRow>;
      minStartDate: string | null;
      maxEndDate: string | null;
    }>(),
    'Load Failed': props<{ error: string }>(),
  },
});