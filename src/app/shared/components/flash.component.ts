import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Outcome } from '../../core/facades/outcome';

// The result of the last action: a confirmation, or the API's refusal.
@Component({
  selector: 'app-flash',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let o = outcome();
    <div class="banner" [class.banner-ok]="o.ok" [class.banner-error]="!o.ok" role="status">
      <span>{{ o.ok ? o.message : o.error.message }}</span>
      <button type="button" class="link" aria-label="Dismiss" (click)="dismiss.emit()">✕</button>
    </div>
  `,
})
export class FlashComponent {
  readonly outcome = input.required<Outcome>();
  readonly dismiss = output<void>();
}
