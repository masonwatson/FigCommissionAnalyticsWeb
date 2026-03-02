import { createReducer, on } from '@ngrx/store';
import { MonthlyTrendActions, MonthlyTrendRow } from './monthly-trend.actions';

export const MONTHLY_TREND_FEATURE_KEY = 'monthlyTrend';

export type MonthlyTrendState = {
  items: ReadonlyArray<MonthlyTrendRow>;
  minStartDate: string | null;
  maxEndDate: string | null;
  selectedDateRange: [number, number] | null;
  isLoading: boolean;
  error: string | null;
};

export const initialState: MonthlyTrendState = {
  items: [],
  minStartDate: null,
  maxEndDate: null,
  selectedDateRange: null,
  isLoading: false,
  error: null,
};

export const monthlyTrendReducer = createReducer(
  initialState,
  on(MonthlyTrendActions.resetRequested, () => ({ ...initialState })),
  on(MonthlyTrendActions.loadRequested, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(MonthlyTrendActions.dateRangeChanged, (state, { range }) => ({
    ...state,
    selectedDateRange: range,
  })),
  on(MonthlyTrendActions.dateRangeCleared, (state) => ({
    ...state,
    selectedDateRange: null,
  })),
  on(MonthlyTrendActions.loadSucceeded, (state, { items, minStartDate, maxEndDate }) => ({
    ...state,
    items,
    minStartDate,
    maxEndDate,
    isLoading: false,
  })),
  on(MonthlyTrendActions.loadFailed, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
);