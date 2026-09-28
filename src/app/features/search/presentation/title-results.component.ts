import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CopyAction, CopyCondition, TitleCopies, TitleDraft, TitleSearchPage, TitleSummary } from '../../../core/models';
import { TitleAdminComponent } from './title-admin.component';
import { TitleCopiesComponent } from './title-copies.component';

export interface TitleEdit { readonly title: TitleSummary; readonly draft: TitleDraft }
export interface NewCopy { readonly title: TitleSummary; readonly barcode: string; readonly condition: CopyCondition }

// One row per title, with the copies free to borrow now (P8). A patron is offered Borrow (P2) when one is free, else
// Place hold (P3); the API still decides and a refusal comes back as a message. A librarian manages it instead, and can
// open one title's copies (L2d).
@Component({
  selector: 'app-title-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleAdminComponent, TitleCopiesComponent],
  template: `
    @let result = page();
    <p class="muted">{{ result.totalCount }} {{ result.totalCount === 1 ? 'title' : 'titles' }}</p>
    <ul class="cards">
      @for (t of result.items; track t.titleId) {
        <li class="card" [class.card-managed]="canManage()">
          <div>
            <h3>{{ t.title }}</h3>
            <p>{{ t.author }} · <span class="tag">{{ t.genre }}</span></p>
            <p class="muted small">ISBN {{ t.isbn }}</p>
            <p class="small">
              @if (t.copiesFree > 0) {
                <span class="tag tag-ok">{{ t.copiesFree }} {{ t.copiesFree === 1 ? 'copy' : 'copies' }} free</span>
              } @else {
                <span class="tag">none free</span>
              }
            </p>
          </div>
          @if (canBorrow()) {
            <div class="card-actions">
              @if (t.copiesFree > 0) {
                <button type="button" class="primary" [disabled]="busyId() === t.titleId" (click)="borrow.emit(t.titleId)">
                  Borrow
                </button>
              } @else {
                <button type="button" class="primary" [disabled]="busyId() === t.titleId" (click)="hold.emit(t.titleId)">
                  Place hold
                </button>
              }
            </div>
          }
          @if (canManage()) {
            <app-title-admin
              class="card-admin"
              [title]="t"
              [busy]="busyId() === t.titleId"
              [genres]="genres()"
              [copiesOpen]="openCopies() === t.titleId"
              (toggleCopies)="toggleCopies.emit(t.titleId)"
              (save)="edit.emit({ title: t, draft: $event })"
              (addCopy)="addCopy.emit({ title: t, barcode: $event.barcode, condition: $event.condition })"
              (remove)="remove.emit(t)"
            />
            @if (openCopies() === t.titleId) {
              <div class="panel">
                @if (copiesError(); as message) {
                  <p class="danger">{{ message }}</p>
                } @else if (copies(); as shelf) {
                  <app-title-copies [copies]="shelf" [busy]="busyId() === t.titleId" (act)="copyAction.emit({ title: t, action: $event })" />
                } @else {
                  <p class="muted small">Loading copies…</p>
                }
              </div>
            }
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
  readonly canManage = input(false);
  readonly busyId = input<string | null>(null);
  readonly genres = input<readonly string[]>([]);
  // The title whose copies are open, and those copies once loaded.
  readonly openCopies = input<string | null>(null);
  readonly copies = input<TitleCopies | null>(null);
  readonly copiesError = input<string | null>(null);
  readonly borrow = output<string>();
  readonly hold = output<string>();
  readonly goTo = output<number>();
  readonly edit = output<TitleEdit>();
  readonly addCopy = output<NewCopy>();
  readonly remove = output<TitleSummary>();
  readonly toggleCopies = output<string>();
  readonly copyAction = output<{ title: TitleSummary; action: CopyAction }>();
}
