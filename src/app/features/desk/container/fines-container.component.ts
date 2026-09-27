import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FinesFacade } from '../../../core/facades/fines.facade';
import { Outcome } from '../../../core/facades/outcome';
import { FlashComponent } from '../../../shared/components';
import { FineOverride, FineOverrideFormComponent } from '../presentation/fine-override-form.component';
import { LastPaymentComponent } from '../presentation/last-payment.component';
import { PaymentFormComponent } from '../presentation/payment-form.component';
import { ReversePaymentFormComponent } from '../presentation/reverse-payment-form.component';

@Component({
  selector: 'app-fines-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaymentFormComponent, LastPaymentComponent, FineOverrideFormComponent, ReversePaymentFormComponent, FlashComponent],
  template: `
    <h1>Fines &amp; payments</h1>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    <section>
      <h2>Record a payment</h2>
      <app-payment-form [busy]="busy()" [done]="paid()" (pay)="pay($event.memberId, $event.amount)" />
      @if (fines.lastPayment(); as payment) {
        <app-last-payment [payment]="payment" [busy]="busy()" (pickFine)="pickedFine.set($event)"
          (reversal)="run(fines.reversePayment($event.paymentId, $event.reason))" />
      }
    </section>
    <section>
      <h2>Waive or lower a fine</h2>
      <app-fine-override-form [busy]="busy()" [fineId]="pickedFine()" (override)="override($event)" />
    </section>
    <section>
      <h2>Reverse an earlier payment</h2>
      <app-reverse-payment-form [busy]="busy()" (reversal)="run(fines.reversePayment($event.paymentId, $event.reason))" />
    </section>
  `,
})
export class FinesContainerComponent {
  protected readonly fines = inject(FinesFacade);
  protected readonly busy = signal(false);
  protected readonly paid = signal(0);
  protected readonly pickedFine = signal<string | null>(null);
  protected readonly outcome = signal<Outcome | null>(null);

  protected async pay(memberId: string, amount: number): Promise<void> {
    if ((await this.run(this.fines.recordPayment(memberId, amount))).ok) this.paid.update(n => n + 1);
  }

  protected override(o: FineOverride): Promise<Outcome> {
    const request = { reason: o.reason, note: o.note };
    return this.run(o.amount === null ? this.fines.waive(o.fineId, request) : this.fines.adjust(o.fineId, o.amount, request));
  }

  protected async run(action: Promise<Outcome>): Promise<Outcome> {
    this.busy.set(true);
    const outcome = await action;
    this.outcome.set(outcome);
    this.busy.set(false);
    return outcome;
  }
}
