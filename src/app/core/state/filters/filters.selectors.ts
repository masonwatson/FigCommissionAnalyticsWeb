import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FilterPageKey } from './filters.action';
import { FiltersState } from './filters.recucer';

export const selectFiltersState = createFeatureSelector<FiltersState>('filters');

export const selectAgentFilterOptions = createSelector(
  selectFiltersState,
  (state) => state.agents,
);

export const selectSelectedAgentByPage = (pageKey: FilterPageKey) =>
  createSelector(selectFiltersState, (state) => state.selectedAgentByPage[pageKey]);

export const selectSelectedAgentIdByPage = (pageKey: FilterPageKey) =>
  createSelector(selectSelectedAgentByPage(pageKey), (selectedAgent) => selectedAgent?.agentId ?? null);

export const selectIsLoadingAgentFilters = createSelector(
  selectFiltersState,
  (state) => state.isLoadingAgents,
);

export const selectLoadAgentFiltersError = createSelector(
  selectFiltersState,
  (state) => state.loadAgentsError,
);
