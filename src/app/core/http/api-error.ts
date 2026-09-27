import { HttpErrorResponse } from '@angular/common/http';

// The API answers a refusal with { code, message } (Library.Api ErrorResponse) and a malformed request with
// ProblemDetails. The message is written for the person at the screen, so it is shown as is.
export interface ApiError {
  readonly code: string;
  readonly message: string;
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body: unknown = err.error;
    if (isErrorBody(body)) return { code: body.code, message: body.message };
    if (isProblem(body)) return { code: `HTTP_${err.status}`, message: body.detail ?? body.title };
    if (err.status === 0) return { code: 'OFFLINE', message: 'The library service can’t be reached.' };
    if (err.status === 401) return { code: 'UNAUTHENTICATED', message: 'Your session has ended. Sign in again.' };
    if (err.status === 403) return { code: 'FORBIDDEN', message: 'You aren’t allowed to do this.' };
    return { code: `HTTP_${err.status}`, message: 'Something went wrong. Try again.' };
  }
  return { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Something went wrong. Try again.' };
}

function isErrorBody(body: unknown): body is ApiError {
  return typeof body === 'object' && body !== null
    && typeof (body as { code?: unknown }).code === 'string'
    && typeof (body as { message?: unknown }).message === 'string';
}

function isProblem(body: unknown): body is { title: string; detail?: string } {
  return typeof body === 'object' && body !== null && typeof (body as { title?: unknown }).title === 'string';
}
