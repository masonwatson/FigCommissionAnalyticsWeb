import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AgentsService } from '../../api/agents.service';
import { FiltersActions } from './filters.action';

@Injectable({ providedIn: 'root' })
export class FiltersEffects {
  private readonly actions$ = inject(Actions);
  private readonly agentsService = inject(AgentsService);

  readonly loadAllAgents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FiltersActions.loadAllAgentsRequested),
      // Keep HTTP in effects and normalize API errors into a single failure action.
      switchMap(() =>
        this.agentsService.getAllAgents().pipe(
          map((response) =>
            FiltersActions.loadAllAgentsSucceeded({
              items: response.agents,
            }),
          ),
          catchError((error: unknown) =>
            of(
              FiltersActions.loadAllAgentsFailed({
                error: this.toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to load agents.';
  }
}
