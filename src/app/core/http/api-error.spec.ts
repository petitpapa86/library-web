import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { toApiError } from './api-error';

const response = (status: number, error: unknown) => new HttpErrorResponse({ status, error });

describe('toApiError', () => {
  it('keeps the API refusal as it is', () => {
    expect(toApiError(response(409, { code: 'NO_COPY_AVAILABLE', message: 'No copy is available.' })))
      .toEqual({ code: 'NO_COPY_AVAILABLE', message: 'No copy is available.' });
  });

  it('reads a ProblemDetails body', () => {
    expect(toApiError(response(400, { title: 'Bad request', detail: 'Unknown genre.' })).message).toBe('Unknown genre.');
  });

  it('explains an unreachable server and an ended session', () => {
    expect(toApiError(response(0, null)).code).toBe('OFFLINE');
    expect(toApiError(response(401, null)).code).toBe('UNAUTHENTICATED');
  });

  it('falls back to a generic message', () => {
    expect(toApiError(response(500, 'boom')).message).toBe('Something went wrong. Try again.');
    expect(toApiError('???').code).toBe('UNKNOWN');
  });
});
