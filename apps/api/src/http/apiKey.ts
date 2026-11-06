import { createHash, timingSafeEqual } from 'node:crypto';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { errorResponse } from './errors.js';

export const API_KEY_HEADER = 'x-api-key';

// Hashing first gives both sides the same length, which timingSafeEqual requires.
function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/**
 * Checks the shared secret that the proxy in front of the API adds to each request.
 * Returns an error response to send, or `undefined` when the request may proceed.
 */
export function requireApiKey(
  request: HttpRequest,
  context: InvocationContext,
): HttpResponseInit | undefined {
  const expected = process.env.API_KEY;
  if (!expected) {
    context.error('API_KEY is not configured; rejecting request.');
    return errorResponse(500, 'INTERNAL', 'Something went wrong. Please try again.');
  }

  const provided = request.headers.get(API_KEY_HEADER);
  if (provided === null || !timingSafeEqual(digest(provided), digest(expected))) {
    return errorResponse(401, 'UNAUTHORIZED', 'Missing or invalid API key.');
  }
  return undefined;
}
