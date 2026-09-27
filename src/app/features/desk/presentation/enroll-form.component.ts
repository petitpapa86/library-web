import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnrollPatronRequest } from '../../../core/models';

// L0 — a name and at least one way to reach the patron (C-14); the API mints the Member ID.
@Component({
  selector: 'app-enroll-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
      <label>Full name <input formControlName="fullName" autocomplete="off" /></label>
      <div class="grid-2">
        <label>Email <input formControlName="email" type="email" autocomplete="off" /></label>
        <label>Phone <input formControlName="phone" type="tel" autocomplete="off" /></label>
      </div>
      @if (noContact()) { <p class="small danger">Give an email or a phone number.</p> }
      <div class="actions"><button type="submit" class="primary" [disabled]="form.invalid || busy()">Enroll</button></div>
    </form>
  `,
})
export class EnrollFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly done = input(0);
  readonly enroll = output<EnrollPatronRequest>();

  protected readonly form = this.fb.group({ fullName: ['', Validators.required], email: [''], phone: [''] });

  constructor() {
    effect(() => {
      if (this.done() > 0) this.form.reset();
    });
  }

  protected noContact(): boolean {
    const { email, phone } = this.form.getRawValue();
    return this.form.dirty && !email.trim() && !phone.trim();
  }

  protected submit(): void {
    const { fullName, email, phone } = this.form.getRawValue();
    if (this.form.invalid || (!email.trim() && !phone.trim())) return;
    this.enroll.emit({ fullName: fullName.trim(), email: email.trim() || null, phone: phone.trim() || null });
  }
}
