import type { Product } from '@mm/shared';
import rawProducts from '../data/products.json' with { type: 'json' };
import { catalogSchema } from './productSchema.js';

let productsById: ReadonlyMap<string, Product> | undefined;

function assertColorwaysResolve(products: ReadonlyMap<string, Product>): void {
  for (const product of products.values()) {
    for (const { productId } of product.colorways ?? []) {
      if (!products.has(productId)) {
        throw new Error(`Product ${product.id} links to unknown colourway ${productId}`);
      }
    }
  }
}

/** Validates the JSON on first use and caches it. Throws if the data does not match the contract. */
function loadProducts(): ReadonlyMap<string, Product> {
  if (!productsById) {
    const products = new Map(catalogSchema.parse(rawProducts).map((p) => [p.id, p] as const));
    assertColorwaysResolve(products);
    productsById = products;
  }
  return productsById;
}

/** Async so a database or PIM-backed implementation can replace it without changing callers. */
export async function findProductById(id: string): Promise<Product | undefined> {
  return loadProducts().get(id);
}
