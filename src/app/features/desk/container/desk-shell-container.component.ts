import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DeskLog } from '../../../core/facades/desk-log';
import { DeskLogComponent } from '../presentation/desk-log.component';

// The librarian desk: a section menu, the section, and the log of what happened at the desk this session.
@Component({
  selector: 'app-desk-shell-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DeskLogComponent],
  template: `
    <nav class="tabs" aria-label="Desk sections">
      @for (s of sections; track s.path) {
        <a [routerLink]="s.path" routerLinkActive="active">{{ s.label }}</a>
      }
    </nav>
    <div class="desk">
      <div class="desk-main"><router-outlet /></div>
      <app-desk-log [entries]="log.entries()" (clear)="log.clear()" />
    </div>
  `,
})
export class DeskShellContainerComponent {
  protected readonly log = inject(DeskLog);
  protected readonly sections = [
    { path: 'circulation', label: 'Circulation' },
    { path: 'copies', label: 'Copies' },
    { path: 'titles', label: 'Titles' },
    { path: 'patrons', label: 'Patrons' },
    { path: 'fines', label: 'Fines & payments' },
    { path: 'reports', label: 'Reports' },
  ] as const;
}
