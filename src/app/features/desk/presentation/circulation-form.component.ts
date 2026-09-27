import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CirculationRequest {
  readonly memberId: string;
  readonly barcode: string;
  readonly toMaintenance: boolean;
}

// L3b checkout, L3a return (optionally to maintenance, R-10), L3c lost: the member's card and the copy in hand.
// After a success the barcode clears and the Member ID stays, ready for the member's next copy.
@Component({
  selector: 'app-circulation-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="emit('checkOut')">
      <div class="grid-2">
        <label>Member ID <input formControlName="memberId" autocomplete="off" placeholder="M000001" /></label>
        <label>Barcode <input formControlName="barcode" autocomplete="off" /></label>
      </div>
      <label class="check"><input type="checkbox" formControlName="toMaintenance" /> Returned damaged: send to maintenance</label>
      <div class="actions">
        <button type="submit" class="primary" [disabled]="form.invalid || busy()">Check out</button>
        <button type="button" [disabled]="form.invalid || busy()" (click)="emit('return')">Return</button>
        <button type="button" class="danger-button" [disabled]="form.invalid || busy()" (click)="emit('lost')">Mark lost</button>
      </div>
    </form>
  `,
})
export class CirculationFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  // Bumped by the container after a success.
  readonly done = input(0);
  readonly checkOut = output<CirculationRequest>();
  readonly return = output<CirculationRequest>();
  readonly lost = output<CirculationRequest>();

  protected readonly form = this.fb.group({
    memberId: ['', Validators.required],
    barcode: ['', Validators.required],
    toMaintenance: [false],
  });

  constructor() {
    effect(() => {
      if (this.done() > 0) this.form.patchValue({ barcode: '', toMaintenance: false });
    });
  }

  protected emit(action: 'checkOut' | 'return' | 'lost'): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request = { memberId: value.memberId.trim(), barcode: value.barcode.trim(), toMaintenance: value.toMaintenance };
    ({ checkOut: this.checkOut, return: this.return, lost: this.lost })[action].emit(request);
  }
}
