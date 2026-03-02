import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AgentListItem } from '../../api/agents.service';

export type FilterPageKey = 'monthlyTrend' | 'insuranceCarrierBreakdown';

export const FiltersActions = createActionGroup({
  source: 'Filters',
  events: {
    'Reset Requested': emptyProps(),
    'Load All Agents Requested': emptyProps(),
    'Load All Agents Succeeded': props<{ items: ReadonlyArray<AgentListItem> }>(),
    'Load All Agents Failed': props<{ error: string }>(),
    'Agent Selected': props<{ pageKey: FilterPageKey; selectedAgentId: number | null }>(),
  },
});
