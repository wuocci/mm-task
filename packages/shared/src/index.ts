/**
 * API contract shared by `@mm/api` and `@mm/web`.
 * Types only: the API imports this package with `import type`, so it must not contain runtime code.
 */

export interface Money {
  amount: number;
  currency: 'EUR';
}

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Size {
  label: string;
  sku: string;
  inStock: boolean;
}

/** One colour of a style. Each colourway is its own product with its own id, images and stock. */
export interface Colorway {
  productId: string;
  colorName: string;
  swatch: readonly string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  badges: readonly string[];
  colorName: string;
  colorways?: readonly Colorway[];
  price: Money;
  /** original price, used only when product is on sale / campaign is active. */
  compareAtPrice?: Money;
  description: readonly string[];
  pattern?: { name: string; designer: string };
  sizes: readonly Size[];
  images: readonly ProductImage[];
  details: {
    material: string;
    fit?: string;
  };
}

export type ApiErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
