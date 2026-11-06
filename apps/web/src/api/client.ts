import type { ApiErrorBody, ApiErrorCode } from '@mm/shared';

const REQUEST_TIMEOUT_MS = 10_000;

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

/** Whether trying again could succeed: transport failures and server errors, not client errors. */
export function isRetryable(error: ApiError): boolean {
  return error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.status >= 500;
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

/**
 * GETs JSON from the API. Every failure becomes an `ApiError`, except cancellation by the
 * caller's `signal`, which rethrows the original error so TanStack Query can recognise it.
 */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  let response: Response;
  let body: unknown;
  try {
    response = await fetch(path, {
      headers: { Accept: 'application/json' },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    body = await response.json().catch(() => undefined);
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) throw new ApiError(0, 'TIMEOUT', 'The request timed out.');
    throw new ApiError(0, 'NETWORK', 'Could not reach the server.');
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
