import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="banner banner-error" role="alert">
      <span>{{ message() }}</span>
      @if (retryable()) {
        <button type="button" class="link" (click)="retry.emit()">Try again</button>
      }
    </div>
  `,
})
export class ErrorBannerComponent {
  readonly message = input.required<string>();
  readonly retryable = input(false);
  readonly retry = output<void>();
}
