import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type FinancialAdvisorRow = {
  agentId: number;
  agentName: string;
  averageMonthlyCommission: number;
  totalCommission: number;
  averageMonthlyStatementVolume: number;
  statementVolume: number;
  bestYearMonth: string;
  topCarrierId: number;
  topCarrierName: string;
};

export const FinancialAdvisorSummaryActions = createActionGroup({
  source: 'FinancialAdvisorSummary',
  events: {
    'Load Requested': emptyProps(),
    'Date Range Changed': props<{ range: [number, number] }>(),
    'Date Range Cleared': emptyProps(),
    'Load Succeeded': props<{
      items: ReadonlyArray<FinancialAdvisorRow>;
      minStartDate: string | null;
      maxEndDate: string | null;
    }>(),
    'Load Failed': props<{ error: string }>(),
  },
});