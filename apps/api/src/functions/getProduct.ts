import { app, type HttpHandler } from '@azure/functions';
import type { Product } from '@mm/shared';
import { requireApiKey } from '../http/apiKey.js';
import { errorResponse } from '../http/errors.js';
import { findProductById } from '../products/catalog.js';

/** Model code + colour code, e.g. "097382-190". */
const PRODUCT_ID_PATTERN = /^\d{6}-\d{3}$/;

type FindProduct = (id: string) => Promise<Product | undefined>;

export function createGetProductHandler(findProduct: FindProduct): HttpHandler {
  return async (request, context) => {
    const unauthorized = requireApiKey(request, context);
    if (unauthorized) return unauthorized;

    const id = request.params.id ?? '';
    if (!PRODUCT_ID_PATTERN.test(id)) {
      return errorResponse(400, 'BAD_REQUEST', 'Invalid product id.');
    }

    try {
      const product = await findProduct(id);
      if (!product) {
        return errorResponse(404, 'NOT_FOUND', `Product ${id} was not found.`);
      }
      return {
        status: 200,
        jsonBody: product,
        headers: { 'Cache-Control': 'public, max-age=60' },
      };
    } catch (error) {
      context.error('Failed to load product', { id, error });
      return errorResponse(500, 'INTERNAL', 'Something went wrong. Please try again.');
    }
  };
}

app.http('getProduct', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/{id}',
  handler: createGetProductHandler(findProductById),
});
