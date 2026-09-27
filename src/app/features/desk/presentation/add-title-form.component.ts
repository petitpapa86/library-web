import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewTitle } from '../../../core/models';

// L1a — the ISBN (10 or 13 digits) is set once and never changes (C-12). The genre must be one the library has
// configured; the API says so if it isn't.
@Component({
  selector: 'app-add-title-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid-2">
        <label>ISBN <input formControlName="isbn" autocomplete="off" /></label>
        <label>Genre <input formControlName="genre" autocomplete="off" /></label>
      </div>
      <label>Title <input formControlName="title" autocomplete="off" /></label>
      <label>Author <input formControlName="author" autocomplete="off" /></label>
      <div class="actions"><button type="submit" class="primary" [disabled]="form.invalid || busy()">Add title</button></div>
    </form>
  `,
})
export class AddTitleFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly done = input(0);
  readonly add = output<NewTitle>();

  protected readonly form = this.fb.group({
    isbn: ['', Validators.required], title: ['', Validators.required],
    author: ['', Validators.required], genre: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.done() > 0) this.form.reset();
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.add.emit({ isbn: v.isbn.trim(), title: v.title.trim(), author: v.author.trim(), genre: v.genre.trim() });
  }
}
