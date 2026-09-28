import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session } from './core/auth/session';
import { NoticesFacade } from './core/facades/notices.facade';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly session = inject(Session);
  protected readonly notices = inject(NoticesFacade);
  private readonly router = inject(Router);

  constructor() {
    // Back from Keycloak: go where the guard sent the user from.
    effect(() => {
      if (!this.session.isSignedIn()) return;
      const returnUrl = this.session.takeReturnUrl();
      if (returnUrl) void this.router.navigateByUrl(returnUrl);
    });
  }
}
