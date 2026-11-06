import type { Product } from '@mm/shared';
import rawProduct from '../data/product.json' with { type: 'json' };
import { productSchema } from './productSchema.js';

let productsById: ReadonlyMap<string, Product> | undefined;

/** Validates the JSON on first use and caches it. Throws if the data does not match the contract. */
function loadProducts(): ReadonlyMap<string, Product> {
  if (!productsById) {
    const product = productSchema.parse(rawProduct);
    productsById = new Map([[product.id, product]]);
  }
  return productsById;
}

/** Async so a database or PIM-backed implementation can replace it without changing callers. */
export async function findProductById(id: string): Promise<Product | undefined> {
  return loadProducts().get(id);
}
