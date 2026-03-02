import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MONTHLY_TREND_FEATURE_KEY, MonthlyTrendState } from './monthly-trend.reducer';

export type MonthlyTrendVm = {
  rows: MonthlyTrendState['items'];
  minStartDate: string | null;
  maxEndDate: string | null;
  isLoading: boolean;
  error: string | null;
};

export const selectMonthlyTrendState =
  createFeatureSelector<MonthlyTrendState>(MONTHLY_TREND_FEATURE_KEY);

export const selectMonthlyTrendVm = createSelector(
  selectMonthlyTrendState,
  (state): MonthlyTrendVm => ({
    rows: state.items,
    minStartDate: state.minStartDate,
    maxEndDate: state.maxEndDate,
    isLoading: state.isLoading,
    error: state.error,
  }),
);