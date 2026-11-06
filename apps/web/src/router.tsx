import { isServer, QueryCache, QueryClient } from '@tanstack/react-query';
import { createRouter, isNotFound } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen';

const MAX_RETRIES = 1;

/** Called once per server request and once in the browser, so each request gets its own cache. */
export function getRouter() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        // The server function already logs server-side; not-found is an expected outcome.
        if (!isServer && !isNotFound(error)) console.error('[query]', error);
      },
    }),
    defaultOptions: {
      queries: {
        // Retry once in the browser. On the server, fail fast and let the error page offer a retry.
        retry: (failureCount, error) =>
          !isServer && !isNotFound(error) && failureCount < MAX_RETRIES,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Start loading a page's data on hover or touch of a link to it.
    defaultPreload: 'intent',
    // Let Query decide freshness instead of the router's own preload cache.
    defaultPreloadStaleTime: 0,
  });

  // Sends the server's query cache to the browser with the HTML and restores it there.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
