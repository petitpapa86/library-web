import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AccountHold } from '../../../core/models';

// Waiting holds show their place in the queue; a ready one, the last day to collect it at the desk (P3, P6).
@Component({
  selector: 'app-holds',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <ul class="rows">
      @for (hold of holds(); track hold.holdId) {
        <li class="row">
          <div>
            <strong>{{ hold.title?.title ?? 'Title no longer in the catalog' }}</strong>
            <span class="muted small"> {{ hold.title?.author }}</span>
            <div>
              @if (hold.status === 'READY') {
                <span class="tag tag-ok">Ready</span> Collect it at the desk by {{ hold.pickupDeadline | date: 'mediumDate' }}.
              } @else {
                <span class="tag">Waiting</span> {{ hold.position === 1 ? 'You’re next.' : 'Number ' + hold.position + ' in the queue.' }}
              }
            </div>
          </div>
          <button type="button" [disabled]="busyId() === hold.holdId" (click)="cancel.emit(hold.holdId)">Cancel</button>
        </li>
      }
    </ul>
  `,
})
export class HoldsComponent {
  readonly holds = input.required<readonly AccountHold[]>();
  readonly busyId = input<string | null>(null);
  readonly cancel = output<string>();
}
