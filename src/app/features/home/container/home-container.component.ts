import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Session } from '../../../core/auth/session';
import { HomeComponent } from '../presentation/home.component';

@Component({
  selector: 'app-home-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeComponent],
  template: `
    <app-home
      [signedIn]="session.isSignedIn()"
      [patron]="session.isPatron()"
      [librarian]="session.isLibrarian()"
      [name]="session.userName()"
      (signIn)="session.signIn()"
    />
  `,
})
export class HomeContainerComponent {
  protected readonly session = inject(Session);
}
