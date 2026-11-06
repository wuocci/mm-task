import type { ApiErrorCode, Product } from '@mm/shared';

export interface ValidSubscription {
  email: string;
  size: string;
}

export type SubscriptionValidation =
  | { ok: true; value: ValidSubscription }
  | { ok: false; code: ApiErrorCode; message: string };

/** RFC 5321 caps an address at 254 characters. */
const MAX_EMAIL_LENGTH = 254;
/** Something loose, nothin crazy */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks a subscription request body against the product it's for. */
export function validateSubscription(body: unknown, product: Product): SubscriptionValidation {
  if (typeof body !== 'object' || body === null) {
    return {
      ok: false,
      code: 'BAD_REQUEST',
      message: 'Expected a JSON object with email and size.',
    };
  }
  const { email, size } = body as Record<string, unknown>;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (normalizedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, code: 'INVALID_EMAIL', message: 'Enter a valid email address.' };
  }

  const match = typeof size === 'string' ? product.sizes.find((s) => s.label === size) : undefined;
  if (!match) {
    return { ok: false, code: 'INVALID_SIZE', message: `Unknown size for product ${product.id}.` };
  }
  // A back-in-stock alert for a size that's in stock would never fire.
  if (match.inStock) {
    return { ok: false, code: 'INVALID_SIZE', message: `Size ${match.label} is in stock.` };
  }

  return { ok: true, value: { email: normalizedEmail, size: match.label } };
}
