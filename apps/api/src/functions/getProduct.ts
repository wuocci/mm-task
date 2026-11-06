import { app, type HttpHandler } from '@azure/functions';
import type { Product } from '@mm/shared';
import { requireApiKey } from '../http/apiKey.js';
import { errorResponse } from '../http/errors.js';
import { findProductById } from '../products/catalog.js';
import { isValidSku } from '../products/sku.js';

type FindProduct = (sku: string) => Promise<Product | undefined>;

export function createGetProductHandler(findProduct: FindProduct): HttpHandler {
  return async (request, context) => {
    const unauthorized = requireApiKey(request, context);
    if (unauthorized) return unauthorized;

    const sku = request.params.sku ?? '';
    if (!isValidSku(sku)) {
      return errorResponse(400, 'BAD_REQUEST', 'Invalid SKU.');
    }

    try {
      const product = await findProduct(sku);
      if (!product) {
        return errorResponse(404, 'NOT_FOUND', `Product ${sku} was not found.`);
      }
      return {
        status: 200,
        jsonBody: product,
        headers: { 'Cache-Control': 'public, max-age=60' },
      };
    } catch (error) {
      context.error('Failed to load product', { sku, error });
      return errorResponse(500, 'INTERNAL', 'Something went wrong. Please try again.');
    }
  };
}

app.http('getProduct', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/{sku}',
  handler: createGetProductHandler(findProductById),
});
