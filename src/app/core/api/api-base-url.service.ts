import { Injectable, signal } from '@angular/core';
import { Configuration } from './generated/configuration';

@Injectable({ providedIn: 'root' })
export class ApiBaseUrlService {
  private readonly fallbackInputValue = 'localhost:44391';
  private readonly useFallbackInputValue = false;
  private readonly _inputValue = signal(this.useFallbackInputValue ? this.fallbackInputValue : '');

  readonly inputValue = this._inputValue.asReadonly();
  readonly configuration = new Configuration({
    basePath: this.useFallbackInputValue ? this.normalizeBaseUrl(this.fallbackInputValue) : ''
  });

  setBaseUrlInput(rawValue: string): void {
    const trimmed = rawValue.trim();
    const nextInputValue = trimmed || (this.useFallbackInputValue ? this.fallbackInputValue : '');

    this._inputValue.set(nextInputValue);
    this.configuration.basePath = this.normalizeBaseUrl(nextInputValue);
  }

  setFallbackAsPrimaryBaseUrl(): void {
    this._inputValue.set(this.fallbackInputValue);
    this.configuration.basePath = this.normalizeBaseUrl(this.fallbackInputValue);
  }

  getHealthUrl(useFallbackBaseUrl = false): string {
    const source = useFallbackBaseUrl ? this.fallbackInputValue : this._inputValue();
    return this.normalizeHealthUrl(source);
  }

  private normalizeBaseUrl(rawValue: string): string {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return '';
    }

    if (trimmed.startsWith('/')) {
      return trimmed.replace(/\/+$/, '');
    }

    const parsed = this.tryParseUrl(trimmed);
    if (!parsed) {
      return trimmed.replace(/\/+$/, '');
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, '');

    const isLocalProxyTarget =
      /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname) &&
      (parsed.port === '44391' || parsed.port === '');

    if (isLocalProxyTarget) {
      if (!normalizedPath || normalizedPath === '/') {
        return '/api/v1';
      }

      if (normalizedPath.startsWith('/api')) {
        return normalizedPath;
      }

      return '/api/v1';
    }

    const path = !normalizedPath || normalizedPath === '/' ? '/api/v1' : normalizedPath;
    return `${parsed.origin}${path}`;
  }

  private tryParseUrl(value: string): URL | null {
    const candidate = /^(https?:)?\/\//i.test(value) ? value : `https://${value}`;

    try {
      return new URL(candidate);
    } catch {
      return null;
    }
  }

  private normalizeHealthUrl(rawValue: string): string {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return '/api/health';
    }

    if (trimmed.startsWith('/')) {
      return '/api/health';
    }

    const parsed = this.tryParseUrl(trimmed);
    if (!parsed) {
      return '/api/health';
    }

    const isLocalProxyTarget =
      /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname) &&
      (parsed.port === '44391' || parsed.port === '');

    if (isLocalProxyTarget) {
      return '/api/health';
    }

    return `${parsed.origin}/api/health`;
  }
}
