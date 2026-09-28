import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeskFacade } from '../../../core/facades/desk.facade';
import { Outcome } from '../../../core/facades/outcome';
import { FlashComponent } from '../../../shared/components';
import { CopyAction } from '../../../core/models';
import { CopyFormComponent } from '../presentation/copy-form.component';

@Component({
  selector: 'app-copies-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CopyFormComponent, FlashComponent],
  template: `
    <h1>Copies</h1>
    <p class="muted">New copies are added from a title in the <a routerLink="/search">catalog</a>.</p>
    <app-copy-form [busy]="busy()" (act)="run($event)" />
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
  `,
})
export class CopiesContainerComponent {
  private readonly desk = inject(DeskFacade);
  protected readonly busy = signal(false);
  protected readonly outcome = signal<Outcome | null>(null);

  protected async run(action: CopyAction): Promise<void> {
    this.busy.set(true);
    this.outcome.set(await this.perform(action));
    this.busy.set(false);
  }

  private perform(action: CopyAction): Promise<Outcome> {
    switch (action.kind) {
      case 'condition': return this.desk.changeCondition(action.barcode, action.condition);
      case 'maintenance': return this.desk.sendToMaintenance(action.barcode);
      case 'backInService': return this.desk.endMaintenance(action.barcode);
      case 'found': return this.desk.markFound(action.barcode);
    }
  }
}
