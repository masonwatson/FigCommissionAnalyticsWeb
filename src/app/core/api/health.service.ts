import {
	HttpClient,
	HttpContext,
	HttpEvent,
	HttpResponse,
} from '@angular/common/http';
import { Inject, Injectable, Optional, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH, Configuration } from './generated';
import { BaseService } from './generated/api.base.service';
import { ApiBaseUrlService } from './api-base-url.service';

export interface HealthResponse {
	status: 'Healthy' | string;
}

@Injectable({ providedIn: 'root' })
export class HealthService extends BaseService {
	private readonly apiBaseUrlService = inject(ApiBaseUrlService);

	constructor(
		protected httpClient: HttpClient,
		@Optional() @Inject(BASE_PATH) basePath: string | string[],
		@Optional() configuration?: Configuration,
	) {
		super(basePath, configuration);
	}

	getHealth(
		observe?: 'body',
		reportProgress?: boolean,
		options?: {
			httpHeaderAccept?: 'application/json';
			context?: HttpContext;
			transferCache?: boolean;
			useFallbackBaseUrl?: boolean;
		},
	): Observable<HealthResponse>;
	getHealth(
		observe?: 'response',
		reportProgress?: boolean,
		options?: {
			httpHeaderAccept?: 'application/json';
			context?: HttpContext;
			transferCache?: boolean;
			useFallbackBaseUrl?: boolean;
		},
	): Observable<HttpResponse<HealthResponse>>;
	getHealth(
		observe?: 'events',
		reportProgress?: boolean,
		options?: {
			httpHeaderAccept?: 'application/json';
			context?: HttpContext;
			transferCache?: boolean;
			useFallbackBaseUrl?: boolean;
		},
	): Observable<HttpEvent<HealthResponse>>;
	getHealth(
		observe: any = 'body',
		reportProgress = false,
		options?: {
			httpHeaderAccept?: 'application/json';
			context?: HttpContext;
			transferCache?: boolean;
			useFallbackBaseUrl?: boolean;
		},
	): Observable<any> {
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

		const localVarPath = this.apiBaseUrlService.getHealthUrl(!!options?.useFallbackBaseUrl);
		const { withCredentials } = this.configuration;

		return this.httpClient.request<HealthResponse>('get', localVarPath, {
			context: localVarHttpContext,
			responseType: <any>responseType_,
			...(withCredentials ? { withCredentials } : {}),
			headers: localVarHeaders,
			observe,
			...(localVarTransferCache !== undefined
				? { transferCache: localVarTransferCache }
				: {}),
			reportProgress,
		});
	}
}
