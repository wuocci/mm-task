import { app, type HttpHandler } from '@azure/functions';
import type { Product, SubscriptionResponse } from '@mm/shared';
import { requireApiKey } from '../http/apiKey.js';
import { errorResponse } from '../http/errors.js';
import { findProductById } from '../products/catalog.js';
import { isValidSku } from '../products/sku.js';
import { type SaveSubscription, saveSubscription } from '../subscriptions/subscriptionStore.js';
import { validateSubscription } from '../subscriptions/validation.js';

type FindProduct = (sku: string) => Promise<Product | undefined>;

export function createSubscriptionHandler(
  findProduct: FindProduct,
  save: SaveSubscription,
): HttpHandler {
  return async (request, context) => {
    const unauthorized = requireApiKey(request, context);
    if (unauthorized) return unauthorized;

    const sku = request.params.sku ?? '';
    if (!isValidSku(sku)) {
      return errorResponse(400, 'BAD_REQUEST', 'Invalid SKU.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, 'BAD_REQUEST', 'The request body must be JSON.');
    }

    try {
      // Checked before the body, so an unknown product is a 404 whatever was sent.
      const product = await findProduct(sku);
      if (!product) {
        return errorResponse(404, 'NOT_FOUND', `Product ${sku} was not found.`);
      }

      const validation = validateSubscription(body, product);
      if (!validation.ok) {
        return errorResponse(400, validation.code, validation.message);
      }

      const result = await save({ sku, ...validation.value });
      const response: SubscriptionResponse = {
        status: result === 'created' ? 'subscribed' : 'already-subscribed',
      };
      return {
        status: result === 'created' ? 201 : 200,
        jsonBody: response,
        headers: { 'Cache-Control': 'no-store' },
      };
    } catch (error) {
      // No email in to the logs
      context.error('Failed to save subscription', { sku, error });
      return errorResponse(500, 'INTERNAL', 'Something went wrong. Please try again.');
    }
  };
}

app.http('createSubscription', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'products/{sku}/subscriptions',
  handler: createSubscriptionHandler(findProductById, saveSubscription),
});
