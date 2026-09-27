import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// L4c — what the patron paid at the desk; the API spreads it over their fines, oldest first.
@Component({
  selector: 'app-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid-2">
        <label>Member ID <input formControlName="memberId" autocomplete="off" placeholder="M000001" /></label>
        <label>Amount <input formControlName="amount" type="number" min="0.01" step="0.01" inputmode="decimal" /></label>
      </div>
      <div class="actions"><button type="submit" class="primary" [disabled]="form.invalid || busy()">Record payment</button></div>
    </form>
  `,
})
export class PaymentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly busy = input(false);
  readonly done = input(0);
  readonly pay = output<{ memberId: string; amount: number }>();

  protected readonly form = this.fb.group({
    memberId: this.fb.nonNullable.control('', Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  constructor() {
    effect(() => {
      if (this.done() > 0) this.form.controls.amount.reset();
    });
  }

  protected submit(): void {
    const { memberId, amount } = this.form.getRawValue();
    if (this.form.invalid || amount === null) return;
    this.pay.emit({ memberId: memberId.trim(), amount });
  }
}
