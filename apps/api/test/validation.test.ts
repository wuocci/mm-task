import { describe, expect, it } from 'vitest';
import { validateSubscription } from '../src/subscriptions/validation.js';
import { product } from './fixtures.js';

describe('validateSubscription', () => {
  it('accepts a valid email and a sold-out size', () => {
    expect(validateSubscription({ email: 'anna@example.com', size: '38' }, product)).toEqual({
      ok: true,
      value: { email: 'anna@example.com', size: '38' },
    });
  });

  it('trims and lowercases the email, so casing cannot create a duplicate', () => {
    const result = validateSubscription({ email: '  Anna@Example.COM ', size: '38' }, product);
    expect(result).toEqual({ ok: true, value: { email: 'anna@example.com', size: '38' } });
  });

  it('accepts an email of exactly 254 characters', () => {
    const email = `${'a'.repeat(242)}@example.com`;
    expect(email).toHaveLength(254);
    expect(validateSubscription({ email, size: '38' }, product).ok).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['missing @', 'anna.example.com'],
    ['no dot in the domain', 'anna@example'],
    ['nothing before @', '@example.com'],
    ['contains a space', 'an na@example.com'],
    ['two @ signs', 'anna@@example.com'],
    ['longer than 254 characters', `${'a'.repeat(243)}@example.com`],
    ['not a string', 42],
    ['missing', undefined],
  ])('rejects an invalid email (%s)', (_case, email) => {
    expect(validateSubscription({ email, size: '38' }, product)).toMatchObject({
      ok: false,
      code: 'INVALID_EMAIL',
    });
  });

  it.each([
    ['unknown label', '99'],
    ['number instead of label', 38],
    ['missing', undefined],
    ['SKU instead of label', '097382-190-38'],
  ])('rejects an unknown size (%s)', (_case, size) => {
    expect(validateSubscription({ email: 'anna@example.com', size }, product)).toMatchObject({
      ok: false,
      code: 'INVALID_SIZE',
    });
  });

  it('rejects a size that is in stock, since the alert would never fire', () => {
    expect(validateSubscription({ email: 'anna@example.com', size: '40' }, product)).toEqual({
      ok: false,
      code: 'INVALID_SIZE',
      message: 'Size 40 is in stock.',
    });
  });

  it('reports the email first when both fields are invalid', () => {
    expect(validateSubscription({ email: 'nope', size: '99' }, product)).toMatchObject({
      code: 'INVALID_EMAIL',
    });
  });

  it.each([
    ['null', null],
    ['a string', 'anna@example.com'],
    ['a number', 1],
  ])('rejects a body that is not an object (%s)', (_case, body) => {
    expect(validateSubscription(body, product)).toMatchObject({ ok: false, code: 'BAD_REQUEST' });
  });
});
