import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogAdminFacade } from '../../../core/facades/catalog-admin.facade';
import { DeletedTitlesFacade } from '../../../core/facades/deleted-titles.facade';
import { GenreFacade } from '../../../core/facades/genre.facade';
import { Outcome } from '../../../core/facades/outcome';
import { NewTitle } from '../../../core/models';
import { ErrorBannerComponent, FlashComponent } from '../../../shared/components';
import { AddTitleFormComponent } from '../presentation/add-title-form.component';
import { DeletedTitlesComponent } from '../presentation/deleted-titles.component';

@Component({
  selector: 'app-titles-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AddTitleFormComponent, DeletedTitlesComponent, ErrorBannerComponent, FlashComponent],
  template: `
    <h1>Titles</h1>
    <p class="muted">Edit, delete, see or add copies to a title from the <a routerLink="/search">catalog</a>.</p>
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    <section>
      <h2>Add a title</h2>
      <app-add-title-form [busy]="busy()" [done]="added()" [genres]="genre.genres()" (add)="add($event)" />
    </section>
    <section>
      <h2>Restore a deleted title</h2>
      @if (deleted.error(); as message) {
        <app-error-banner [message]="message" [retryable]="true" (retry)="deleted.reload()" />
      }
      <app-deleted-titles
        [page]="deleted.page()"
        [pageCount]="deleted.pageCount()"
        [busy]="busy() || deleted.isLoading()"
        (search)="deleted.search($event)"
        (goTo)="deleted.goToPage($event)"
        (restore)="run(catalog.restore($event))"
      />
    </section>
  `,
})
export class TitlesContainerComponent {
  protected readonly catalog = inject(CatalogAdminFacade);
  protected readonly deleted = inject(DeletedTitlesFacade);
  protected readonly genre = inject(GenreFacade);
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
