/**
 * Server-only HTTP client for the Azure Functions API. The `.server.ts` suffix makes Start refuse
 * to bundle this file for the browser, so the API key and the API's address never reach the client.
 */
import type { ApiErrorBody, ApiErrorCode } from '@mm/shared';

const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_API_URL = 'http://localhost:7071';
const API_KEY_HEADER = 'x-api-key';

/** API error codes plus failures that happen before a response arrives. */
export type ClientErrorCode = ApiErrorCode | 'NETWORK' | 'TIMEOUT' | 'UNKNOWN';

export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    /** HTTP status, or 0 when no response was received. */
    readonly status: number,
    readonly code: ClientErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value;
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/** GETs JSON from the API. */
export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>('GET', path);
}

/** POSTs a JSON body to the API and returns the JSON response. */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>('POST', path, body);
}

/**
 * Calls the API with the API key attached. Every failure becomes an `ApiError`.
 * Env is read per call, not at module load, so it reflects the running server's configuration.
 */
async function apiRequest<T>(method: 'GET' | 'POST', path: string, payload?: unknown): Promise<T> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new ApiError(0, 'INTERNAL', 'API_KEY is not set in apps/web/.env.local.');
  }
  const baseUrl = process.env.API_URL ?? DEFAULT_API_URL;
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  let response: Response;
  let body: unknown;
  try {
    response = await fetch(new URL(path, baseUrl), {
      method,
      headers: {
        Accept: 'application/json',
        [API_KEY_HEADER]: apiKey,
        ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: payload === undefined ? null : JSON.stringify(payload),
      signal: timeout,
    });
    body = await response.json().catch(() => undefined);
  } catch {
    if (timeout.aborted) throw new ApiError(0, 'TIMEOUT', 'The request timed out.');
    throw new ApiError(0, 'NETWORK', `Could not reach the API at ${baseUrl}.`);
  }

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message);
    }
    throw new ApiError(
      response.status,
      'UNKNOWN',
      `Request failed with status ${response.status}.`,
    );
  }
  if (body === undefined) {
    throw new ApiError(response.status, 'UNKNOWN', 'The response was not valid JSON.');
  }

  // Not validated here: the API validates its data against the shared contract.
  return body as T;
}
