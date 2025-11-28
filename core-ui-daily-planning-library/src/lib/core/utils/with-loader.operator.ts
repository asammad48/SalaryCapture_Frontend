import { inject } from '@angular/core';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../../data/shared/loader.service';

/**
 * RxJS operator that automatically manages loader state for an Observable.
 * 
 * @param loaderKey - Unique identifier for the loader instance
 * @returns MonoTypeOperatorFunction that shows loader on subscription and hides on completion/error
 * 
 * @example
 * ```typescript
 * // In a component
 * this.apiClient.getBasePlans(request)
 *   .pipe(withLoader('BasePlan_List'))
 *   .subscribe(response => {
 *     // Handle response
 *   });
 * ```
 * 
 * @example
 * ```typescript
 * // With other operators
 * this.apiClient.getBasePlans(request)
 *   .pipe(
 *     withLoader('BasePlan_List'),
 *     map(response => response.data),
 *     catchError(error => {
 *       console.error(error);
 *       return of(null);
 *     })
 *   )
 *   .subscribe(data => {
 *     // Handle data
 *   });
 * ```
 */
export function withLoader<T>(loaderKey: string): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> => {
    const loaderService = inject(LoaderService);

    if (!loaderKey) {
      console.warn('withLoader: loaderKey is required but not provided. Loader will not be shown.');
      return source;
    }

    return new Observable<T>(observer => {
      // Show loader when subscription starts
      loaderService.show(loaderKey);

      // Subscribe to the source observable
      const subscription = source.pipe(
        finalize(() => {
          // Hide loader when observable completes, errors, or unsubscribes
          loaderService.hide(loaderKey);
        })
      ).subscribe({
        next: (value) => observer.next(value),
        error: (error) => observer.error(error),
        complete: () => observer.complete()
      });

      // Return teardown logic
      return () => {
        subscription.unsubscribe();
      };
    });
  };
}

/**
 * Alternative standalone function that can be used without inject context
 * Useful when you need to pass LoaderService explicitly
 * 
 * @param loaderService - Instance of LoaderService
 * @param loaderKey - Unique identifier for the loader instance
 * @returns MonoTypeOperatorFunction that shows loader on subscription and hides on completion/error
 * 
 * @example
 * ```typescript
 * // In a component constructor or method
 * constructor(private loaderService: LoaderService, private apiClient: Client) {}
 * 
 * loadData() {
 *   this.apiClient.getBasePlans(request)
 *     .pipe(withLoaderService(this.loaderService, 'BasePlan_List'))
 *     .subscribe(response => {
 *       // Handle response
 *     });
 * }
 * ```
 */
export function withLoaderService<T>(
  loaderService: LoaderService, 
  loaderKey: string
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> => {
    if (!loaderKey) {
      console.warn('withLoaderService: loaderKey is required but not provided. Loader will not be shown.');
      return source;
    }

    if (!loaderService) {
      console.error('withLoaderService: LoaderService is required but not provided. Loader will not be shown.');
      return source;
    }

    return new Observable<T>(observer => {
      // Show loader when subscription starts
      loaderService.show(loaderKey);

      // Subscribe to the source observable
      const subscription = source.pipe(
        finalize(() => {
          // Hide loader when observable completes, errors, or unsubscribes
          loaderService.hide(loaderKey);
        })
      ).subscribe({
        next: (value) => observer.next(value),
        error: (error) => observer.error(error),
        complete: () => observer.complete()
      });

      // Return teardown logic
      return () => {
        subscription.unsubscribe();
      };
    });
  };
}
