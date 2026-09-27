import { Injectable, computed, inject, resource } from '@angular/core';
import { Session } from '../auth/session';
import { toApiError } from '../http/api-error';
import { MyAccountService } from '../services/my-account.service';
import { Outcome, attempt } from './outcome';

// The signed-in patron's account (P5) and everything they do to it: self checkout (P2), renew (P4), place and cancel
// holds (P3, P6). Loads only for a patron, so a librarian's screens never call /me. Every change reloads the account.
@Injectable({ providedIn: 'root' })
export class MyAccountFacade {
  private readonly service = inject(MyAccountService);
  private readonly session = inject(Session);

  private readonly _account = resource({
    params: () => (this.session.isPatron() ? true : undefined),
    loader: () => this.service.account(),
  });

  readonly account = computed(() => this._account.value() ?? null);
  readonly isLoading = computed(() => this._account.isLoading());
  readonly error = computed(() => {
    const err = this._account.error();
    return err ? toApiError(err.cause ?? err) : null;
  });

  reload(): void {
    this._account.reload();
  }

  checkOut(titleId: string): Promise<Outcome> {
    return this.change(() => this.service.checkOut(titleId), loan => `Borrowed (copy ${loan.barcode}), due ${loan.dueDate}.`);
  }

  renew(loanId: string): Promise<Outcome> {
    return this.change(() => this.service.renew(loanId), loan => `Renewed, now due ${loan.dueDate}.`);
  }

  placeHold(titleId: string): Promise<Outcome> {
    return this.change(() => this.service.placeHold(titleId), () => 'Hold placed. You’ll get a notice when a copy is ready.');
  }

  cancelHold(holdId: string): Promise<Outcome> {
    return this.change(() => this.service.cancelHold(holdId), () => 'Hold cancelled.');
  }

  private async change<T>(fn: () => Promise<T>, confirm: (value: T) => string): Promise<Outcome> {
    const outcome = await attempt(fn, confirm);
    if (outcome.ok) this._account.reload();
    return outcome;
  }
}
