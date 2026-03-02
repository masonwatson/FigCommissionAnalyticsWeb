import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    'Api Base Url Input Changed': props<{ value: string }>(),
    'Health Check Requested': props<{ useFallbackBaseUrl?: boolean }>(),
    'Health Check Succeeded': props<{ status: string }>(),
    'Health Check Failed': props<{ error: string }>(),
  },
});
