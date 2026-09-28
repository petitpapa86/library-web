import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatronSearchPage } from '../../../core/models';

// L0f — a patron without their card: part of the name or email (2+ characters); pick one to look them up (L0e).
@Component({
  selector: 'app-patron-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="actions" [formGroup]="form" (ngSubmit)="submit()" role="search">
      <input formControlName="q" placeholder="Name or email" aria-label="Name or email" autocomplete="off" />
      <button type="submit" [disabled]="form.invalid || busy()">Find</button>
    </form>
    @if (page(); as result) {
      @if (result.totalCount === 0) {
        <p class="empty">No patron matches.</p>
      } @else {
        <table>
          <thead><tr><th>Patron</th><th>Contact</th><th></th></tr></thead>
          <tbody>
            @for (p of result.items; track p.patronId) {
              <tr>
                <td>
                  {{ p.name }} <span class="mono small muted">{{ p.memberId }}</span>
                  @if (p.closed) { <span class="tag tag-danger">closed</span> }
                </td>
                <td class="small muted">{{ p.email ?? 'no email' }} · {{ p.phone ?? 'no phone' }}</td>
                <td class="right"><button type="button" (click)="pick.emit(p.memberId)">Look up</button></td>
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
export class PatronSearchComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly page = input<PatronSearchPage | null>(null);
  readonly pageCount = input(1);
  readonly busy = input(false);
  readonly search = output<string>();
  readonly goTo = output<number>();
  readonly pick = output<string>();

  protected readonly form = this.fb.group({ q: ['', [Validators.required, Validators.pattern(/^\s*\S.*\S\s*$/)]] });

  protected submit(): void {
    if (this.form.valid) this.search.emit(this.form.getRawValue().q.trim());
  }
}
