import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MyNotice } from '../../../core/models';

// R-09 — my notices, newest first: unread ones stand out and can be marked read.
@Component({
  selector: 'app-notices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <ul class="rows">
      @for (n of notices(); track n.noticeId) {
        <li class="row" [class.muted]="n.readAt">
          <div>
            @switch (n.kind) {
              @case ('HOLD_READY') {
                <strong>{{ name(n) }}</strong> is ready for you: collect it at the desk by
                {{ n.pickupDeadline | date: 'mediumDate' }}.
              }
              @case ('LOAN_DUE_SOON') {
                <strong>{{ name(n) }}</strong> is due on {{ n.dueDate | date: 'mediumDate' }}. Renew it below if you need
                longer.
              }
              @case ('LOAN_OVERDUE') {
                <strong>{{ name(n) }}</strong> was due on {{ n.dueDate | date: 'mediumDate' }} and is overdue: return it
                to stop the fine growing.
              }
            }
            <br /><span class="small muted">{{ n.postedAt | date: 'medium' }}</span>
          </div>
          @if (!n.readAt) {
            <button type="button" class="link" [disabled]="busyId() === n.noticeId" (click)="markRead.emit(n.noticeId)">Mark read</button>
          }
        </li>
      }
    </ul>
  `,
})
export class NoticesComponent {
  readonly notices = input.required<readonly MyNotice[]>();
  readonly busyId = input<string | null>(null);
  readonly markRead = output<string>();

  protected name(notice: MyNotice): string {
    return notice.title ? `“${notice.title.title}”` : 'A title no longer in the catalog';
  }
}
