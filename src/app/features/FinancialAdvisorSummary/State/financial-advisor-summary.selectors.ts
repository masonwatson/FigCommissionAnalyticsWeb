import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FinancialAdvisorSummaryState } from './financial-advisor-summary.reducer';

export type FinancialAdvisorSummaryVm = {
  rows: FinancialAdvisorSummaryState['items'];
  minStartDate: string | null;
  maxEndDate: string | null;
  isLoading: boolean;
  error: string | null;
};

export const selectFinancialAdvisorSummaryState =
  createFeatureSelector<FinancialAdvisorSummaryState>('financialAdvisorSummary');

export const selectFinancialAdvisorSummaryVm = createSelector(
  selectFinancialAdvisorSummaryState,
  (state): FinancialAdvisorSummaryVm => ({
    rows: state.items,
    minStartDate: state.minStartDate,
    maxEndDate: state.maxEndDate,
    isLoading: state.isLoading,
    error: state.error,
  }),
);