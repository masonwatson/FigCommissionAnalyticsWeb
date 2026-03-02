import {
  HttpClient,
  HttpContext,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  AgentSummary,
  BASE_PATH,
  Configuration,
} from './generated';
import { BaseService } from './generated/api.base.service';
import { OpenApiHttpParams, QueryParamStyle } from './generated/query.params';

export interface AgentsQueryParams {
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface AgentByIdParams {
  agentId: number;
  startDate?: string;
  endDate?: string;
}

export interface AgentListItem {
  agentId: number;
  agentName: string;
}

export interface GetAllAgentsResponse {
  agents: readonly AgentListItem[];
}

@Injectable({ providedIn: 'root' })
export class AgentsService extends BaseService {
  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string | string[],
    @Optional() configuration?: Configuration,
  ) {
    super(basePath, configuration);
  }

  getAllAgents(
    params?: AgentsQueryParams,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    },
  ): Observable<GetAllAgentsResponse>;
  getAllAgents(
    params?: AgentsQueryParams,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    },
  ): Observable<HttpResponse<GetAllAgentsResponse>>;
  getAllAgents(
    params?: AgentsQueryParams,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    },
  ): Observable<HttpEvent<GetAllAgentsResponse>>;
  getAllAgents(
    params?: AgentsQueryParams,
    observe: any = 'body',
    reportProgress = false,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    },
  ): Observable<any> {
    let localVarQueryParameters = new OpenApiHttpParams(this.encoder);

    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      'startDate',
      params?.startDate,
      QueryParamStyle.Form,
      true,
    );

    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      'endDate',
      params?.endDate,
      QueryParamStyle.Form,
      true,
    );

    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      'sort',
      params?.sort,
      QueryParamStyle.Form,
      true,
    );

    let localVarHeaders = this.defaultHeaders;

    const localVarHttpHeaderAcceptSelected: string | undefined =
      options?.httpHeaderAccept ??
      this.configuration.selectHeaderAccept(['application/json']);
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected,
      );
    }

    const localVarHttpContext: HttpContext =
      options?.context ?? new HttpContext();
    const localVarTransferCache: boolean = options?.transferCache ?? true;

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    const localVarPath = `/agent`;
    const { basePath, withCredentials } = this.configuration;
    return this.httpClient.request<GetAllAgentsResponse>(
      'get',
      `${basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters.toHttpParams(),
        responseType: <any>responseType_,
        ...(withCredentials ? { withCredentials } : {}),
        headers: localVarHeaders,
        observe,
        ...(localVarTransferCache !== undefined
          ? { transferCache: localVarTransferCache }
          : {}),
        reportProgress,
      },
    );
  }

  getAgentById(_params: AgentByIdParams): Observable<AgentSummary | null> {
    return throwError(() => new Error('AgentsService.getAgentById is not implemented yet.'));
  }
}
