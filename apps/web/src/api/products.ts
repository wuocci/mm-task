import type { Product } from '@mm/shared';
import { queryOptions } from '@tanstack/react-query';
import { getJson } from './client';

/** Matches the API's `Cache-Control: max-age=60`. */
const PRODUCT_STALE_TIME_MS = 60_000;

export function fetchProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return getJson<Product>(`/api/products/${encodeURIComponent(id)}`, signal);
}

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ['product', id],
    queryFn: ({ signal }) => fetchProduct(id, signal),
    staleTime: PRODUCT_STALE_TIME_MS,
  });
}
