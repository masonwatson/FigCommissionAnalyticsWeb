import { createReducer, on } from '@ngrx/store';
import {
  InsuranceCarrierBreakdownActions,
  InsuranceCarrierRow,
} from './insurance-carrier-breakdown.actions';

export const INSURANCE_CARRIER_BREAKDOWN_FEATURE_KEY = 'insuranceCarrierBreakdown';

export type InsuranceCarrierBreakdownState = {
  items: ReadonlyArray<InsuranceCarrierRow>;
  minStartDate: string | null;
  maxEndDate: string | null;
  selectedDateRange: [number, number] | null;
  isLoading: boolean;
  error: string | null;
};

export const initialState: InsuranceCarrierBreakdownState = {
  items: [],
  minStartDate: null,
  maxEndDate: null,
  selectedDateRange: null,
  isLoading: false,
  error: null,
};

export const insuranceCarrierBreakdownReducer = createReducer(
  initialState,
  on(InsuranceCarrierBreakdownActions.loadRequested, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(InsuranceCarrierBreakdownActions.dateRangeChanged, (state, { range }) => ({
    ...state,
    selectedDateRange: range,
  })),
  on(InsuranceCarrierBreakdownActions.dateRangeCleared, (state) => ({
    ...state,
    selectedDateRange: null,
  })),
  on(InsuranceCarrierBreakdownActions.loadSucceeded, (state, { items, minStartDate, maxEndDate }) => ({
    ...state,
    items,
    minStartDate,
    maxEndDate,
    isLoading: false,
  })),
  on(InsuranceCarrierBreakdownActions.loadFailed, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
);
