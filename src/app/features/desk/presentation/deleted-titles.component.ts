import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DeletedTitlePage, TitleSearchQuery } from '../../../core/models';

// L1e — find a deleted title by title or author (both empty lists them all) and restore it (L1d).
@Component({
  selector: 'app-deleted-titles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <form class="search-form" [formGroup]="form" (ngSubmit)="search.emit(form.getRawValue())" role="search">
      <label>Title <input formControlName="title" type="search" autocomplete="off" /></label>
      <label>Author <input formControlName="author" type="search" autocomplete="off" /></label>
      <button type="submit" [disabled]="busy()">Find</button>
    </form>
    @if (page(); as result) {
      @if (result.totalCount === 0) {
        <p class="empty">No deleted title matches.</p>
      } @else {
        <table>
          <thead><tr><th>Title</th><th>Deleted</th><th></th></tr></thead>
          <tbody>
            @for (t of result.items; track t.titleId) {
              <tr>
                <td>
                  {{ t.title }}<br />
                  <span class="muted small">{{ t.author }} · {{ t.genre }} · ISBN {{ t.isbn }}</span>
                </td>
                <td class="small">{{ t.deletedAt | date: 'medium' }}</td>
                <td class="right">
                  <button type="button" [disabled]="busy()" (click)="restore.emit(t.titleId)">Restore</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (pageCount() > 1) {
          <nav class="pager" aria-label="Pages">
            <button type="button" [disabled]="result.page <= 1" (click)="goTo.emit(result.page - 1)">Previous</button>
            <span>Page {{ result.page }} of {{ pageCount() }}</span>
            <button type="button" [disabled]="result.page >= pageCount()" (click)="goTo.emit(result.page + 1)">Next</button>
          </nav>
        }
      }
    }
  `,
})
export class DeletedTitlesComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly page = input<DeletedTitlePage | null>(null);
  readonly pageCount = input(1);
  readonly busy = input(false);
  readonly search = output<Omit<TitleSearchQuery, 'page'>>();
  readonly goTo = output<number>();
  readonly restore = output<string>();

  protected readonly form = this.fb.group({ title: [''], author: [''] });
}
