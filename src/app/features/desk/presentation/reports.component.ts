import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActiveFinesReport, OverdueReport, PopularTitlesReport, Reconciliation } from '../../../core/models';

@Component({
  selector: 'app-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="stat-row">
      @if (activeFines(); as f) {
        <div class="stat"><div class="stat-value">{{ f.owed | currency: f.currency }}</div>
          <div class="small muted">owed on {{ f.fines }} fine(s) by {{ f.patrons }} patron(s)</div></div>
      }
      @if (overdue(); as o) {
        <div class="stat"><div class="stat-value">{{ o.loans.length }}</div><div class="small muted">loans overdue</div></div>
      }
      @if (reconciliation(); as r) {
        <div class="stat">
          <div class="stat-value" [class.danger]="!r.balanced">{{ r.balanced ? 'Balanced' : r.findings.length + ' finding(s)' }}</div>
          <div class="small muted">balances checked {{ r.checkedAt | date: 'short' }}</div>
        </div>
      }
    </div>

    @if (reconciliation(); as r) {
      @if (!r.balanced) {
        <section>
          <h2>Reconciliation findings</h2>
          <ul class="rows">
            @for (f of r.findings; track f.recordId + f.code) {
              <li class="row"><span><span class="tag tag-danger">{{ f.code }}</span> {{ f.detail }}</span>
                <span class="mono small muted">{{ f.recordId }}</span></li>
            }
          </ul>
        </section>
      }
    }

    @if (overdue(); as o) {
      <section>
        <h2>Overdue <span class="small muted">as of {{ o.asOf | date: 'mediumDate' }}</span></h2>
        @if (o.loans.length) {
          <table>
            <thead><tr><th>Patron</th><th>Title</th><th>Copy</th><th>Due</th><th class="right">Days late</th></tr></thead>
            <tbody>
              @for (l of o.loans; track l.loanId) {
                <tr>
                  <td>
                    @if (l.patron; as p) {
                      {{ p.name }} <span class="mono small">{{ p.memberId }}</span><br />
                      <span class="small muted">{{ p.email ?? '' }} {{ p.phone ?? '' }}</span>
                    } @else { <span class="muted">Unknown patron</span> }
                  </td>
                  <td>{{ l.title?.title ?? 'Unknown title' }}</td>
                  <td class="mono">{{ l.barcode }}</td>
                  <td>{{ l.dueDate | date: 'mediumDate' }}</td>
                  <td class="right">{{ l.daysOverdue }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty">Nothing is overdue.</p>
        }
      </section>
    }

    @if (popular(); as p) {
      <section>
        <h2>Popular titles <span class="small muted">{{ p.from | date: 'mediumDate' }} – {{ p.asOf | date: 'mediumDate' }}</span></h2>
        @if (p.titles.length) {
          <table>
            <thead><tr><th>#</th><th>Title</th><th class="right">Checkouts</th></tr></thead>
            <tbody>
              @for (t of p.titles; track t.titleId) {
                <tr><td>{{ t.rank }}</td><td>{{ t.title?.title ?? 'Unknown title' }} <span class="small muted">{{ t.title?.author }}</span></td>
                  <td class="right">{{ t.checkouts }}</td></tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty">No checkouts in the last {{ p.windowDays }} days.</p>
        }
      </section>
    }
  `,
})
export class ReportsComponent {
  readonly overdue = input<OverdueReport | null>(null);
  readonly popular = input<PopularTitlesReport | null>(null);
  readonly activeFines = input<ActiveFinesReport | null>(null);
  readonly reconciliation = input<Reconciliation | null>(null);
}
