import { QueryCache, QueryClient } from '@tanstack/react-query';
import { type ApiError, isRetryable } from './client';

declare module '@tanstack/react-query' {
  interface Register {
    // Safe because getJson turns every failure into an ApiError.
    defaultError: ApiError;
  }
}

const MAX_RETRIES = 1;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        // Not-found is an expected outcome; anything else is worth surfacing to developers.
        if (error.code !== 'NOT_FOUND' && error.code !== 'BAD_REQUEST') {
          console.error(`[api] ${error.code} (${error.status}): ${error.message}`);
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => isRetryable(error) && failureCount < MAX_RETRIES,
      },
    },
  });
}
