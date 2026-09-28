import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CopyAction, CopyCondition, CopyStatus, TitleCopies, copyConditions } from '../../../core/models';

const statusLabels: Record<CopyStatus, string> = {
  AVAILABLE: 'on the shelf', ON_LOAN: 'on loan', SET_ASIDE: 'set aside for a hold', IN_MAINTENANCE: 'in maintenance', LOST: 'lost',
};

// L2d — a title's copies, by barcode, each with what the copy-in-hand form does (L2b, L2c, L3c). Only the step that
// fits the copy's status is offered; the API still decides.
@Component({
  selector: 'app-title-copies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    @let shelf = copies();
    @if (!shelf.lendable) {
      <p class="small danger">Closed to lending: the title is deleted. Its copies stay until it is restored.</p>
    }
    @if (shelf.copies.length === 0) {
      <p class="empty">No copy yet.</p>
    } @else {
      <table>
        <thead><tr><th>Barcode</th><th>Condition</th><th>Status</th><th>Added</th><th></th></tr></thead>
        <tbody>
          @for (c of shelf.copies; track c.copyId) {
            <tr>
              <td class="mono">{{ c.barcode }}</td>
              <td>
                <select [disabled]="busy()" [attr.aria-label]="'Condition of ' + c.barcode"
                  (change)="setCondition(c.barcode, $event)">
                  @for (k of conditions; track k) { <option [value]="k" [selected]="k === c.condition">{{ k.toLowerCase() }}</option> }
                </select>
              </td>
              <td><span class="tag" [class.tag-ok]="c.status === 'AVAILABLE'" [class.tag-danger]="c.status === 'LOST'">{{ label(c.status) }}</span></td>
              <td class="small muted">{{ c.addedAt | date: 'mediumDate' }}</td>
              <td class="right">
                @switch (c.status) {
                  @case ('AVAILABLE') {
                    <button type="button" [disabled]="busy()" (click)="act.emit({ kind: 'maintenance', barcode: c.barcode })">To maintenance</button>
                  }
                  @case ('IN_MAINTENANCE') {
                    <button type="button" [disabled]="busy()" (click)="act.emit({ kind: 'backInService', barcode: c.barcode })">Back in service</button>
                  }
                  @case ('LOST') {
                    <button type="button" [disabled]="busy()" (click)="act.emit({ kind: 'found', barcode: c.barcode })">Found</button>
                  }
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class TitleCopiesComponent {
  readonly copies = input.required<TitleCopies>();
  readonly busy = input(false);
  readonly act = output<CopyAction>();

  protected readonly conditions = copyConditions;

  protected label(status: CopyStatus): string {
    return statusLabels[status];
  }

  protected setCondition(barcode: string, event: Event): void {
    const condition = (event.target as HTMLSelectElement).value as CopyCondition;
    this.act.emit({ kind: 'condition', barcode, condition });
  }
}
