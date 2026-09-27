import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Welcome to the library</h1>
      @if (!signedIn()) {
        <p>Sign in to search the catalog, borrow books and follow your loans, holds and fines.</p>
        <button type="button" class="primary" (click)="signIn.emit()">Sign in</button>
      } @else {
        <p>Hello{{ name() ? ', ' + name() : '' }}.</p>
        <div class="actions">
          <a routerLink="/search" class="button primary">Search the catalog</a>
          @if (patron()) {
            <a routerLink="/account" class="button">My account</a>
          }
        </div>
      }
    </section>
  `,
})
export class HomeComponent {
  readonly signedIn = input(false);
  readonly patron = input(false);
  readonly name = input<string | null>(null);
  readonly signIn = output<void>();
}
