import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// L0e — a patron by Member ID (any case).
@Component({
  selector: 'app-patron-lookup-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="actions" [formGroup]="form" (ngSubmit)="submit()" role="search">
      <input formControlName="memberId" placeholder="Member ID, e.g. M000001" aria-label="Member ID" autocomplete="off" />
      <button type="submit" class="primary" [disabled]="form.invalid || busy()">Look up</button>
    </form>
  `,
})
export class PatronLookupFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly lookUp = output<string>();

  protected readonly form = this.fb.group({ memberId: ['', Validators.required] });

  protected submit(): void {
    const memberId = this.form.getRawValue().memberId.trim();
    if (memberId) this.lookUp.emit(memberId);
  }
}
