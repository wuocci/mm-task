import type { SubscriptionResponse } from '@mm/shared';
import { createServerFn } from '@tanstack/react-start';
import { ApiError, apiPost } from './upstream.server';

export type SubscribeResult =
  | { ok: true; status: SubscriptionResponse['status'] }
  | { ok: false; reason: 'INVALID_EMAIL' | 'INVALID_SIZE' | 'NOT_FOUND' | 'ERROR' };

/**
 * Saves a back-in-stock subscription through the API
 */
export const subscribeToRestock = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const { sku, size, email } = (typeof input === 'object' && input !== null ? input : {}) as {
      sku?: unknown;
      size?: unknown;
      email?: unknown;
    };
    if (typeof sku !== 'string' || typeof size !== 'string' || typeof email !== 'string') {
      throw new Error('Expected sku, size and email.');
    }
    return { sku, size, email };
  })
  .handler(async ({ data: { sku, size, email } }): Promise<SubscribeResult> => {
    try {
      const response = await apiPost<SubscriptionResponse>(
        `/api/products/${encodeURIComponent(sku)}/subscriptions`,
        { email, size },
      );
      return { ok: true, status: response.status };
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === 'INVALID_EMAIL' ||
          error.code === 'INVALID_SIZE' ||
          error.code === 'NOT_FOUND')
      ) {
        return { ok: false, reason: error.code };
      }
      // No email in to the logs
      console.error(`[api] Failed to subscribe to ${sku} size ${size}:`, error);
      return { ok: false, reason: 'ERROR' };
    }
  });
