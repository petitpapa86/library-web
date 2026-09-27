import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="empty">{{ message() }}</p>`,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
}
