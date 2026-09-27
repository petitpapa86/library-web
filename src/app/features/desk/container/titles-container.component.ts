import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogAdminFacade } from '../../../core/facades/catalog-admin.facade';
import { Outcome } from '../../../core/facades/outcome';
import { NewTitle } from '../../../core/models';
import { FlashComponent } from '../../../shared/components';
import { AddTitleFormComponent } from '../presentation/add-title-form.component';
import { RestoreTitleFormComponent } from '../presentation/restore-title-form.component';

@Component({
  selector: 'app-titles-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AddTitleFormComponent, RestoreTitleFormComponent, FlashComponent],
  template: `
    <h1>Titles</h1>
    <p class="muted">Edit, delete or add copies to a title from the <a routerLink="/search">catalog</a>.</p>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    <section>
      <h2>Add a title</h2>
      <app-add-title-form [busy]="busy()" [done]="added()" (add)="add($event)" />
    </section>
    <section>
      <h2>Restore a deleted title</h2>
      <app-restore-title-form [busy]="busy()" (restore)="run(catalog.restore($event))" />
    </section>
  `,
})
export class TitlesContainerComponent {
  protected readonly catalog = inject(CatalogAdminFacade);
  protected readonly busy = signal(false);
  protected readonly added = signal(0);
  protected readonly outcome = signal<Outcome | null>(null);

  protected async add(title: NewTitle): Promise<void> {
    if ((await this.run(this.catalog.add(title))).ok) this.added.update(n => n + 1);
  }

  protected async run(action: Promise<Outcome>): Promise<Outcome> {
    this.busy.set(true);
    const outcome = await action;
    this.outcome.set(outcome);
    this.busy.set(false);
    return outcome;
  }
}
