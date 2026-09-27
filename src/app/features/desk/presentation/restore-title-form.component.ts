import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// L1d — a deleted title is hidden from search, so it is restored by its id (the desk log shows it on delete).
@Component({
  selector: 'app-restore-title-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="actions" [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="titleId" class="mono" placeholder="Title id" aria-label="Title id" autocomplete="off" />
      <button type="submit" [disabled]="form.invalid || busy()">Restore</button>
    </form>
  `,
})
export class RestoreTitleFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly restore = output<string>();

  protected readonly form = this.fb.group({
    titleId: ['', [Validators.required, Validators.pattern(/^\s*[0-9a-fA-F-]{36}\s*$/)]],
  });

  protected submit(): void {
    if (this.form.valid) this.restore.emit(this.form.getRawValue().titleId.trim());
  }
}
