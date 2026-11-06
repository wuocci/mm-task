import type { HttpResponseInit } from '@azure/functions';
import type { ApiErrorBody, ApiErrorCode } from '@mm/shared';

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
): HttpResponseInit {
  const body: ApiErrorBody = { error: { code, message } };
  return { status, jsonBody: body, headers: { 'Cache-Control': 'no-store' } };
}
