import type { Product } from '@mm/shared';
import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ApiError, apiGet } from './upstream.server';

/** Matches the API's `Cache-Control: max-age=60`. */
const PRODUCT_STALE_TIME_MS = 60_000;

/**
 * Runs only on the server. During server rendering it's called directly; in the browser
 * (e.g. switching colour) the call becomes a request to this app's server, never to the API.
 */
export const getProduct = createServerFn({ method: 'GET' })
  .validator((id: unknown) => {
    if (typeof id !== 'string') throw new Error('Expected a product id.');
    return id;
  })
  .handler(async ({ data: id }) => {
    try {
      return await apiGet<Product>(`/api/products/${encodeURIComponent(id)}`);
    } catch (error) {
      // The API answers 400 for malformed ids and 404 for unknown ones: both mean "no such product".
      if (
        error instanceof ApiError &&
        (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST')
      ) {
        throw notFound();
      }
      // Log the details here; the browser only gets a generic message.
      console.error(`[api] Failed to load product ${id}:`, error);
      throw new Error('Could not load the product.');
    }
  });

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ['product', id],
    queryFn: () => getProduct({ data: id }),
    staleTime: PRODUCT_STALE_TIME_MS,
  });
}
