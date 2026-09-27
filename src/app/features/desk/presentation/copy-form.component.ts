import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CopyCondition, copyConditions } from '../../../core/models';

export type CopyAction =
  | { readonly kind: 'condition'; readonly barcode: string; readonly condition: CopyCondition }
  | { readonly kind: 'maintenance' | 'backInService' | 'found'; readonly barcode: string };

// A copy in hand, by barcode: its condition (L2b), maintenance in and out (L2c), found after being lost (L3c).
@Component({
  selector: 'app-copy-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="$event.preventDefault()">
      <label>Barcode <input formControlName="barcode" autocomplete="off" /></label>
      <fieldset>
        <legend>Condition</legend>
        <div class="actions">
          <select formControlName="condition" aria-label="Condition">
            @for (c of conditions; track c) { <option [value]="c">{{ c.toLowerCase() }}</option> }
          </select>
          <button type="button" [disabled]="invalid() || busy()" (click)="emit('condition')">Set condition</button>
        </div>
      </fieldset>
      <fieldset>
        <legend>Status</legend>
        <div class="actions">
          <button type="button" [disabled]="invalid() || busy()" (click)="emit('maintenance')">Send to maintenance</button>
          <button type="button" [disabled]="invalid() || busy()" (click)="emit('backInService')">Back in service</button>
          <button type="button" [disabled]="invalid() || busy()" (click)="emit('found')">Lost copy found</button>
        </div>
      </fieldset>
    </form>
  `,
})
export class CopyFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly act = output<CopyAction>();

  protected readonly conditions = copyConditions;
  protected readonly form = this.fb.group({
    barcode: ['', Validators.required],
    condition: ['GOOD' as CopyCondition],
  });

  protected invalid(): boolean {
    return this.form.controls.barcode.value.trim() === '';
  }

  protected emit(kind: CopyAction['kind']): void {
    const { barcode, condition } = this.form.getRawValue();
    const trimmed = barcode.trim();
    this.act.emit(kind === 'condition' ? { kind, barcode: trimmed, condition } : { kind, barcode: trimmed });
  }
}
