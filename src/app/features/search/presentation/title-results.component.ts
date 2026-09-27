import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TitleSearchPage } from '../../../core/models';

// One row per title. A patron can borrow it (P2) or, when no copy is free, join its queue (P3); the API decides
// which applies, so both are offered and a refusal comes back as a message.
@Component({
  selector: 'app-title-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let result = page();
    <p class="muted">{{ result.totalCount }} {{ result.totalCount === 1 ? 'title' : 'titles' }}</p>
    <ul class="cards">
      @for (t of result.items; track t.titleId) {
        <li class="card">
          <div>
            <h3>{{ t.title }}</h3>
            <p>{{ t.author }} · <span class="tag">{{ t.genre }}</span></p>
            <p class="muted small">ISBN {{ t.isbn }}</p>
          </div>
          @if (canBorrow()) {
            <div class="card-actions">
              <button type="button" class="primary" [disabled]="busyId() === t.titleId" (click)="borrow.emit(t.titleId)">
                Borrow
              </button>
              <button type="button" [disabled]="busyId() === t.titleId" (click)="hold.emit(t.titleId)">Place hold</button>
            </div>
          }
        </li>
      }
    </ul>
    @if (pageCount() > 1) {
      <nav class="pager" aria-label="Pages">
        <button type="button" [disabled]="result.page <= 1" (click)="goTo.emit(result.page - 1)">Previous</button>
        <span>Page {{ result.page }} of {{ pageCount() }}</span>
        <button type="button" [disabled]="result.page >= pageCount()" (click)="goTo.emit(result.page + 1)">Next</button>
      </nav>
    }
  `,
})
export class TitleResultsComponent {
  readonly page = input.required<TitleSearchPage>();
  readonly pageCount = input(1);
  readonly canBorrow = input(false);
  readonly busyId = input<string | null>(null);
  readonly borrow = output<string>();
  readonly hold = output<string>();
  readonly goTo = output<number>();
}
