import { InjectionToken } from '@angular/core';

/**
 * Injection token for the API base URL
 *
 * This token should be provided in your application configuration
 * to set the base URL for all API calls made by NSwag-generated clients.
 *
 * Usage in app.config.ts or module providers:
 * ```typescript
 * providers: [
 *   {
 *     provide: API_BASE_URL,
 *     useValue: environment.apiUrl
 *   }
 * ]
 * ```
 *
 * Or using environment variable (like in salary-calculation library):
 * ```typescript
 * providers: [
 *   {
 *     provide: API_BASE_URL,
 *     useValue: process.env["NX_BASE_DP_URL"]
 *   }
 * ]
 * ```
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
