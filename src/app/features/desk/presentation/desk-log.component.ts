import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DeskLogEntry } from '../../../core/facades/desk-log';

@Component({
  selector: 'app-desk-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <aside class="desk-log" aria-label="Desk log">
      <div class="desk-log-head">
        <h2>Desk log</h2>
        @if (entries().length) {
          <button type="button" class="link" (click)="clear.emit()">Clear</button>
        }
      </div>
      @for (entry of entries(); track entry.id) {
        <div class="log-entry" [class.log-ok]="entry.outcome.ok" [class.log-error]="!entry.outcome.ok">
          <div class="small muted">{{ entry.at | date: 'HH:mm:ss' }} · {{ entry.action }}</div>
          <div>{{ entry.outcome.ok ? entry.outcome.message : entry.outcome.error.message }}</div>
        </div>
      } @empty {
        <p class="empty small">Results of desk actions show up here.</p>
      }
    </aside>
  `,
})
export class DeskLogComponent {
  readonly entries = input.required<readonly DeskLogEntry[]>();
  readonly clear = output<void>();
}
