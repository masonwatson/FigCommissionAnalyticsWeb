import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  INSURANCE_CARRIER_BREAKDOWN_FEATURE_KEY,
  InsuranceCarrierBreakdownState,
} from './insurance-carrier-breakdown.reducer';

export type InsuranceCarrierBreakdownVm = {
  rows: InsuranceCarrierBreakdownState['items'];
  minStartDate: string | null;
  maxEndDate: string | null;
  isLoading: boolean;
  error: string | null;
};

export const selectInsuranceCarrierBreakdownState =
  createFeatureSelector<InsuranceCarrierBreakdownState>(
    INSURANCE_CARRIER_BREAKDOWN_FEATURE_KEY,
  );

export const selectInsuranceCarrierBreakdownVm = createSelector(
  selectInsuranceCarrierBreakdownState,
  (state): InsuranceCarrierBreakdownVm => ({
    rows: state.items,
    minStartDate: state.minStartDate,
    maxEndDate: state.maxEndDate,
    isLoading: state.isLoading,
    error: state.error,
  }),
);
