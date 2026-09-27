import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecordedPayment } from '../../../core/models';

// The payment just recorded: the fines it went to (pick one to waive or lower) and its reversal (L4d, reason required).
@Component({
  selector: 'app-last-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ReactiveFormsModule],
  template: `
    @let p = payment();
    <div class="panel stack">
      <p>
        <strong>{{ p.amount | currency: p.currency }}</strong> from {{ p.memberId }} ·
        still owed {{ p.balance | currency: p.currency }}
        <span class="small muted mono">· payment {{ p.paymentId }}</span>
      </p>
      <table>
        <thead><tr><th>Fine</th><th class="right">Applied</th><th class="right">Still owed</th><th>Status</th><th></th></tr></thead>
        <tbody>
          @for (a of p.allocations; track a.fineId) {
            <tr>
              <td class="mono small">{{ a.fineId }}</td>
              <td class="right">{{ a.applied | currency: p.currency }}</td>
              <td class="right">{{ a.owed | currency: p.currency }}</td>
              <td>{{ a.status.toLowerCase() }}</td>
              <td class="right"><button type="button" class="link" (click)="pickFine.emit(a.fineId)">Waive or lower…</button></td>
            </tr>
          }
        </tbody>
      </table>
      <form class="actions" [formGroup]="form" (ngSubmit)="reverse()">
        <input formControlName="reason" placeholder="Why reverse it?" aria-label="Reversal reason" maxlength="500" />
        <button type="submit" class="danger-button" [disabled]="form.invalid || busy()">Reverse payment</button>
      </form>
    </div>
  `,
})
export class LastPaymentComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly payment = input.required<RecordedPayment>();
  readonly busy = input(false);
  readonly pickFine = output<string>();
  readonly reversal = output<{ paymentId: string; reason: string }>();

  protected readonly form = this.fb.group({ reason: ['', Validators.required] });

  protected reverse(): void {
    if (this.form.invalid) return;
    this.reversal.emit({ paymentId: this.payment().paymentId, reason: this.form.getRawValue().reason.trim() });
  }
}
