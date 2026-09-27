import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverrideReason, overrideReasons } from '../../../core/models';

export interface FineOverride {
  readonly fineId: string;
  readonly reason: OverrideReason;
  readonly note: string | null;
  // Absent: waive the whole fine (L4a). Present: lower it by this much (L4b).
  readonly amount: number | null;
}

// L4a waive, L4b lower: a reason from the fixed list (C-09), a note when it is OTHER.
@Component({
  selector: 'app-fine-override-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="$event.preventDefault()">
      <label>Fine ID <input formControlName="fineId" autocomplete="off" class="mono" /></label>
      <div class="grid-2">
        <label>Reason
          <select formControlName="reason">
            @for (r of reasons; track r.code) { <option [value]="r.code">{{ r.label }}</option> }
          </select>
        </label>
        <label>Lower by (leave empty to waive) <input formControlName="amount" type="number" min="0.01" step="0.01" /></label>
      </div>
      <label>Note <input formControlName="note" autocomplete="off" /></label>
      <div class="actions">
        <button type="button" [disabled]="invalid() || busy()" (click)="emit(false)">Waive fine</button>
        <button type="button" [disabled]="invalid() || !form.controls.amount.value || busy()" (click)="emit(true)">Lower fine</button>
      </div>
    </form>
  `,
})
export class FineOverrideFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly busy = input(false);
  // Filled from a payment's allocation.
  readonly fineId = input<string | null>(null);
  readonly override = output<FineOverride>();

  protected readonly reasons = overrideReasons;
  protected readonly form = this.fb.group({
    fineId: this.fb.nonNullable.control('', Validators.required),
    reason: this.fb.nonNullable.control<OverrideReason>('SYSTEM_ERROR'),
    note: this.fb.nonNullable.control(''),
    amount: this.fb.control<number | null>(null, Validators.min(0.01)),
  });

  constructor() {
    effect(() => {
      const id = this.fineId();
      if (id) this.form.controls.fineId.setValue(id);
    });
  }

  protected invalid(): boolean {
    const { fineId, reason, note } = this.form.getRawValue();
    return !fineId.trim() || (reason === 'OTHER' && !note.trim());
  }

  protected emit(lower: boolean): void {
    const { fineId, reason, note, amount } = this.form.getRawValue();
    this.override.emit({ fineId: fineId.trim(), reason, note: note.trim() || null, amount: lower ? amount : null });
  }
}
