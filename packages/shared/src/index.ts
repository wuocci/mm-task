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

/** Body of `POST /api/products/{sku}/subscriptions`. `size` is a size label, e.g. "38". */
export interface SubscriptionRequest {
  email: string;
  size: string;
}

/** 201 with `subscribed` for a new subscription, 200 with `already-subscribed` for a repeat. */
export interface SubscriptionResponse {
  status: 'subscribed' | 'already-subscribed';
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'INVALID_EMAIL'
  | 'INVALID_SIZE'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INTERNAL';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
