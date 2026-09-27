import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="muted" role="status">{{ label() }}</p>`,
})
export class LoadingComponent {
  readonly label = input('Loading…');
}
