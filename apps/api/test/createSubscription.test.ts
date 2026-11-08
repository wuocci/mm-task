import { HttpRequest, type HttpResponseInit, InvocationContext } from '@azure/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubscriptionHandler } from '../src/functions/createSubscription.js';
import type { SaveSubscription } from '../src/subscriptions/subscriptionStore.js';
import { product } from './fixtures.js';

const API_KEY = 'test-key';
const findProduct = async (sku: string) => (sku === product.id ? product : undefined);

interface RequestOptions {
  sku?: string;
  body?: unknown;
  apiKey?: string | null;
}

function request({ sku = product.id, body = {}, apiKey = API_KEY }: RequestOptions = {}) {
  return new HttpRequest({
    method: 'POST',
    url: `http://localhost/api/products/${sku}/subscriptions`,
    params: { sku },
    headers: apiKey === null ? {} : { 'x-api-key': apiKey },
    body: { string: typeof body === 'string' ? body : JSON.stringify(body) },
  });
}

/** Runs the handler with a fake store; the real one needs Azurite. */
async function call(
  options: RequestOptions,
  save: SaveSubscription = vi.fn<SaveSubscription>(async () => 'created'),
) {
  const logs: unknown[][] = [];
  const context = new InvocationContext({ logHandler: (...entry) => logs.push(entry) });
  const handler = createSubscriptionHandler(findProduct, save);
  const response = (await handler(request(options), context)) as HttpResponseInit;
  return { response, logs, save };
}

describe('POST /api/products/{sku}/subscriptions', () => {
  beforeEach(() => vi.stubEnv('API_KEY', API_KEY));
  afterEach(() => vi.unstubAllEnvs());

  it('creates a subscription: 201 with the normalised email', async () => {
    const { response, save } = await call({ body: { email: ' Anna@Example.com', size: '38' } });
    expect(response.status).toBe(201);
    expect(response.jsonBody).toEqual({ status: 'subscribed' });
    expect(save).toHaveBeenCalledWith({ sku: product.id, size: '38', email: 'anna@example.com' });
  });

  it('answers a repeat with 200 already-subscribed instead of a duplicate', async () => {
    const { response } = await call(
      { body: { email: 'anna@example.com', size: '38' } },
      vi.fn<SaveSubscription>(async () => 'exists'),
    );
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ status: 'already-subscribed' });
  });

  it('returns 400 INVALID_EMAIL and saves nothing', async () => {
    const { response, save } = await call({ body: { email: 'nope', size: '38' } });
    expect(response.status).toBe(400);
    expect(response.jsonBody).toMatchObject({ error: { code: 'INVALID_EMAIL' } });
    expect(save).not.toHaveBeenCalled();
  });

  it('returns 400 INVALID_SIZE for a size the product does not have', async () => {
    const { response, save } = await call({ body: { email: 'anna@example.com', size: '99' } });
    expect(response.status).toBe(400);
    expect(response.jsonBody).toMatchObject({ error: { code: 'INVALID_SIZE' } });
    expect(save).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown SKU, even when the body is invalid too', async () => {
    const { response } = await call({ sku: '999999-999', body: { email: 'nope' } });
    expect(response.status).toBe(404);
    expect(response.jsonBody).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('returns 400 for a malformed SKU', async () => {
    const { response } = await call({ sku: 'not-a-sku' });
    expect(response.status).toBe(400);
  });

  it('returns 400 when the body is not JSON', async () => {
    const { response } = await call({ body: 'email=anna@example.com' });
    expect(response.status).toBe(400);
    expect(response.jsonBody).toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });

  it.each([
    ['missing', null],
    ['wrong', 'not-the-key'],
  ])('returns 401 when the API key is %s', async (_case, apiKey) => {
    const { response, save } = await call({
      apiKey,
      body: { email: 'anna@example.com', size: '38' },
    });
    expect(response.status).toBe(401);
    expect(save).not.toHaveBeenCalled();
  });

  it('returns 500 when storage fails, without logging the email', async () => {
    const { response, logs } = await call(
      { body: { email: 'anna@example.com', size: '38' } },
      vi.fn<SaveSubscription>(async () => {
        throw new Error('Storage unavailable');
      }),
    );
    expect(response.status).toBe(500);
    expect(response.jsonBody).toMatchObject({ error: { code: 'INTERNAL' } });
    expect(logs.length).toBeGreaterThan(0);
    expect(JSON.stringify(logs)).not.toContain('anna@example.com');
  });
});
