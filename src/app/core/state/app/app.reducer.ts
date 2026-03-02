import { createReducer, on } from '@ngrx/store';
import { AppActions } from './app.actions';

export type AppState = {
  apiBaseUrlInput: string;
  healthStatus: string | null;
  isCheckingHealth: boolean;
  healthError: string | null;
};

export const initialAppState: AppState = {
  apiBaseUrlInput: '',
  healthStatus: null,
  isCheckingHealth: false,
  healthError: null,
};

export const appReducer = createReducer(
  initialAppState,
  on(AppActions.apiBaseUrlInputChanged, (state, { value }) => ({
    ...state,
    apiBaseUrlInput: value,
  })),
  on(AppActions.healthCheckRequested, (state) => ({
    ...state,
    healthStatus: null,
    isCheckingHealth: true,
    healthError: null,
  })),
  on(AppActions.healthCheckSucceeded, (state, { status }) => ({
    ...state,
    healthStatus: status,
    isCheckingHealth: false,
    healthError: null,
  })),
  on(AppActions.healthCheckFailed, (state, { error }) => ({
    ...state,
    healthStatus: null,
    isCheckingHealth: false,
    healthError: error,
  })),
);
