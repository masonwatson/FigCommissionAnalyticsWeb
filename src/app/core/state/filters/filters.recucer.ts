import { createReducer, on } from '@ngrx/store';
import { AgentListItem } from '../../api/agents.service';
import { FilterPageKey, FiltersActions } from './filters.action';

export type FiltersState = {
  agents: ReadonlyArray<AgentListItem>;
  selectedAgentByPage: Record<FilterPageKey, AgentListItem | null>;
  isLoadingAgents: boolean;
  loadAgentsError: string | null;
};

export const initialFiltersState: FiltersState = {
  agents: [],
  selectedAgentByPage: {
    monthlyTrend: null,
    insuranceCarrierBreakdown: null,
  },
  isLoadingAgents: false,
  loadAgentsError: null,
};

export const filtersReducer = createReducer(
  initialFiltersState,
  on(FiltersActions.loadAllAgentsRequested, (state) => ({
    ...state,
    isLoadingAgents: true,
    loadAgentsError: null,
  })),
  on(FiltersActions.loadAllAgentsSucceeded, (state, { items }) => ({
    ...state,
    agents: items,
    selectedAgentByPage: {
      monthlyTrend: state.selectedAgentByPage.monthlyTrend
        ? items.find((agent) => agent.agentId === state.selectedAgentByPage.monthlyTrend?.agentId) ??
          null
        : null,
      insuranceCarrierBreakdown: state.selectedAgentByPage.insuranceCarrierBreakdown
        ? items.find(
            (agent) =>
              agent.agentId === state.selectedAgentByPage.insuranceCarrierBreakdown?.agentId,
          ) ?? null
        : null,
    },
    isLoadingAgents: false,
  })),
  on(FiltersActions.loadAllAgentsFailed, (state, { error }) => ({
    ...state,
    isLoadingAgents: false,
    loadAgentsError: error,
  })),
  on(FiltersActions.agentSelected, (state, { pageKey, selectedAgentId }) => ({
    ...state,
    selectedAgentByPage: {
      ...state.selectedAgentByPage,
      [pageKey]:
        selectedAgentId === null
          ? null
          : state.agents.find((agent) => agent.agentId === selectedAgentId) ?? null,
    },
  })),
);
