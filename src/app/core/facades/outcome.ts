import { ApiError, toApiError } from '../http/api-error';

// What a mutation tells the screen: a confirmation to show, or the API's refusal.
export type Outcome = { readonly ok: true; readonly message: string } | { readonly ok: false; readonly error: ApiError };

export async function attempt<T>(fn: () => Promise<T>, confirm: (value: T) => string): Promise<Outcome> {
  try {
    return { ok: true, message: confirm(await fn()) };
  } catch (err) {
    return { ok: false, error: toApiError(err) };
  }
}
