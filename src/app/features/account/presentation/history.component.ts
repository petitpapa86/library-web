import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccountPastLoan } from '../../../core/models';

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <table>
      <thead><tr><th>Title</th><th>Borrowed</th><th>Returned</th></tr></thead>
      <tbody>
        @for (loan of history(); track loan.loanId) {
          <tr>
            <td>{{ loan.title?.title ?? 'Title no longer in the catalog' }}</td>
            <td>{{ loan.borrowedOn | date: 'mediumDate' }}</td>
            <td>
              {{ loan.returnedOn | date: 'mediumDate' }}
              @if (loan.lost) { <span class="tag tag-danger">Lost</span> }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class HistoryComponent {
  readonly history = input.required<readonly AccountPastLoan[]>();
}
