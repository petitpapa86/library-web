import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TitleSearchQuery } from '../../../core/models';

export type SearchFilters = Omit<TitleSearchQuery, 'page'>;

// P1 — title, author and genre, ANDed. All empty browses the whole catalog.
@Component({
  selector: 'app-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="search-form" [formGroup]="form" (ngSubmit)="submit()" role="search">
      <label>Title <input formControlName="title" type="search" autocomplete="off" /></label>
      <label>Author <input formControlName="author" type="search" autocomplete="off" /></label>
      <label>Genre
        <select formControlName="genre">
          <option value="">Any genre</option>
          @for (g of genres(); track g) { <option [value]="g">{{ g }}</option> }
        </select>
      </label>
      <button type="submit" class="primary" [disabled]="busy()">Search</button>
    </form>
  `,
})
export class SearchFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly busy = input(false);
  readonly genres = input<readonly string[]>([]);
  readonly search = output<SearchFilters>();

  protected readonly form = this.fb.group({ title: [''], author: [''], genre: [''] });

  protected submit(): void {
    this.search.emit(this.form.getRawValue());
  }
}
