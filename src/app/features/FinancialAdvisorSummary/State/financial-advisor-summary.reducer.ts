import { createReducer, on } from '@ngrx/store';
import { FinancialAdvisorSummaryActions, FinancialAdvisorRow } from './financial-advisor-summary.actions';

export type FinancialAdvisorSummaryState = {
  items: ReadonlyArray<FinancialAdvisorRow>;
  minStartDate: string | null;
  maxEndDate: string | null;
  selectedDateRange: [number, number] | null;
  isLoading: boolean;
  error: string | null;
};

export const initialState: FinancialAdvisorSummaryState = {
  items: [],
  minStartDate: null,
  maxEndDate: null,
  selectedDateRange: null,
  isLoading: false,
  error: null,
};

export const financialAdvisorSummaryReducer = createReducer(
  initialState,
  on(FinancialAdvisorSummaryActions.resetRequested, () => ({ ...initialState })),
  on(FinancialAdvisorSummaryActions.loadRequested, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(FinancialAdvisorSummaryActions.dateRangeChanged, (state, { range }) => ({
    ...state,
    selectedDateRange: range,
  })),
  on(FinancialAdvisorSummaryActions.dateRangeCleared, (state) => ({
    ...state,
    selectedDateRange: null,
  })),
  on(FinancialAdvisorSummaryActions.loadSucceeded, (state, { items, minStartDate, maxEndDate }) => ({
    ...state,
    items,
    minStartDate,
    maxEndDate,
    isLoading: false,
  })),
  on(FinancialAdvisorSummaryActions.loadFailed, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
);