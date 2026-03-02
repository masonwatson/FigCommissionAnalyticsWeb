import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectApiBaseUrlInput = createSelector(
  selectAppState,
  (state) => state.apiBaseUrlInput,
);

export const selectHealthStatus = createSelector(
  selectAppState,
  (state) => state.healthStatus,
);

export const selectIsCheckingHealth = createSelector(
  selectAppState,
  (state) => state.isCheckingHealth,
);

export const selectHealthError = createSelector(
  selectAppState,
  (state) => state.healthError,
);
