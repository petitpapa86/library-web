import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccountFine } from '../../../core/models';

const kindLabels: Record<AccountFine['kind'], string> = { OVERDUE: 'Late return', REPLACEMENT: 'Lost copy' };
const statusLabels: Record<AccountFine['status'], string> = {
  ACCRUING: 'Still growing', CLOSED: 'To pay', WAIVED: 'Waived', CLEARED: 'Paid',
};

// Fines are paid at the desk (L4c); this is read-only.
@Component({
  selector: 'app-fines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <table>
      <thead><tr><th>Fine</th><th>Status</th><th class="right">Accrued</th><th class="right">Owed</th></tr></thead>
      <tbody>
        @for (fine of fines(); track fine.fineId) {
          <tr>
            <td>{{ kindLabel(fine) }}<br /><span class="muted small">due {{ fine.dueDate | date: 'mediumDate' }}</span></td>
            <td>{{ statusLabel(fine) }}</td>
            <td class="right">{{ fine.accrued | currency: currency() }}</td>
            <td class="right">{{ fine.owed | currency: currency() }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class FinesComponent {
  readonly fines = input.required<readonly AccountFine[]>();
  readonly currency = input.required<string>();

  protected kindLabel(fine: AccountFine): string {
    return kindLabels[fine.kind];
  }

  protected statusLabel(fine: AccountFine): string {
    return statusLabels[fine.status];
  }
}
