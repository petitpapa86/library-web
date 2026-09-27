import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AccountLoan } from '../../../core/models';

// Open loans by due date. A loan renews once (C-06); the API refuses the rest (a hold waiting, overdue, blocked).
@Component({
  selector: 'app-loans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <table>
      <thead><tr><th>Title</th><th>Copy</th><th>Borrowed</th><th>Due</th><th></th></tr></thead>
      <tbody>
        @for (loan of loans(); track loan.loanId) {
          <tr [class.overdue]="loan.overdueSince !== null">
            <td>{{ loan.title?.title ?? 'Title no longer in the catalog' }}<br /><span class="muted small">{{ loan.title?.author }}</span></td>
            <td class="mono">{{ loan.barcode }}</td>
            <td>{{ loan.borrowedOn | date: 'mediumDate' }}</td>
            <td>
              {{ loan.dueDate | date: 'mediumDate' }}
              @if (loan.overdueSince) { <span class="tag tag-danger">Overdue</span> }
              @if (loan.renewed) { <span class="tag">Renewed</span> }
            </td>
            <td class="right">
              @if (!loan.renewed) {
                <button type="button" [disabled]="busyId() === loan.loanId" (click)="renew.emit(loan.loanId)">Renew</button>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class LoansComponent {
  readonly loans = input.required<readonly AccountLoan[]>();
  readonly busyId = input<string | null>(null);
  readonly renew = output<string>();
}
