import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type InsuranceCarrierRow = {
  carrierId: number;
  carrierName: string;
  agentCarrierTotalCommissionCents: number;
  agentCarrierRelativeWeightPct: number;
};

export const InsuranceCarrierBreakdownActions = createActionGroup({
  source: 'InsuranceCarrierBreakdown',
  events: {
    'Reset Requested': emptyProps(),
    'Load Requested': emptyProps(),
    'Date Range Changed': props<{ range: [number, number] }>(),
    'Date Range Cleared': emptyProps(),
    'Load Succeeded': props<{
      items: ReadonlyArray<InsuranceCarrierRow>;
      minStartDate: string;
      maxEndDate: string;
    }>(),
    'Load Failed': props<{ error: string }>(),
  },
});
