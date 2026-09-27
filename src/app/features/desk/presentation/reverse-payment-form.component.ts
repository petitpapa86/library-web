import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// L4d for a payment recorded earlier: its id and why.
@Component({
  selector: 'app-reverse-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid-2">
        <label>Payment ID <input formControlName="paymentId" autocomplete="off" class="mono" /></label>
        <label>Reason <input formControlName="reason" maxlength="500" autocomplete="off" /></label>
      </div>
      <div class="actions"><button type="submit" class="danger-button" [disabled]="form.invalid || busy()">Reverse payment</button></div>
    </form>
  `,
})
export class ReversePaymentFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly reversal = output<{ paymentId: string; reason: string }>();

  protected readonly form = this.fb.group({ paymentId: ['', Validators.required], reason: ['', Validators.required] });

  protected submit(): void {
    const { paymentId, reason } = this.form.getRawValue();
    if (this.form.invalid) return;
    this.reversal.emit({ paymentId: paymentId.trim(), reason: reason.trim() });
  }
}
