import { Injectable, inject, signal } from '@angular/core';
import { FineOverrideRequest, RecordedPayment } from '../models';
import { FinesService } from '../services/fines.service';
import { DeskLog } from './desk-log';
import { money } from './money';
import { Outcome, attempt } from './outcome';

// Fines and payments at the desk (L4a–L4d). The last payment recorded is kept, so its fines can be waived or adjusted
// and the payment itself reversed, without retyping ids.
@Injectable({ providedIn: 'root' })
export class FinesFacade {
  private readonly service = inject(FinesService);
  private readonly log = inject(DeskLog);

  private readonly _lastPayment = signal<RecordedPayment | null>(null);
  readonly lastPayment = this._lastPayment.asReadonly();

  async recordPayment(memberId: string, amount: number): Promise<Outcome> {
    return this.run(`Payment from ${memberId}`, async () => {
      const payment = await this.service.recordPayment(memberId, amount);
      this._lastPayment.set(payment);
      return payment;
    }, p => `${money(p.amount, p.currency)} from ${p.memberId} went to ${p.allocations.length} fine(s); `
      + `${money(p.balance, p.currency)} still owed.`);
  }

  async reversePayment(paymentId: string, reason: string): Promise<Outcome> {
    return this.run('Reverse payment', () => this.service.reversePayment(paymentId, reason), r => {
      if (this._lastPayment()?.paymentId === r.paymentId) this._lastPayment.set(null);
      return `Payment of ${money(r.amount, r.currency)} reversed; the patron owes ${money(r.balance, r.currency)} again.`;
    });
  }

  async waive(fineId: string, request: FineOverrideRequest): Promise<Outcome> {
    return this.run('Waive fine', () => this.service.waive(fineId, request),
      f => `Fine waived: ${money(f.waived, f.currency)} taken off, ${money(f.owed, f.currency)} owed.`);
  }

  async adjust(fineId: string, amount: number, request: FineOverrideRequest): Promise<Outcome> {
    return this.run('Lower fine', () => this.service.adjust(fineId, amount, request),
      f => `Fine lowered by ${money(f.adjustment, f.currency)}; ${money(f.owed, f.currency)} owed.`);
  }

  private async run<T>(action: string, fn: () => Promise<T>, confirm: (value: T) => string): Promise<Outcome> {
    return this.log.record(action, await attempt(fn, confirm));
  }
}
