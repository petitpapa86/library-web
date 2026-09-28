import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Session } from '../../../core/auth/session';
import { CatalogAdminFacade } from '../../../core/facades/catalog-admin.facade';
import { DeskFacade } from '../../../core/facades/desk.facade';
import { GenreFacade } from '../../../core/facades/genre.facade';
import { MyAccountFacade } from '../../../core/facades/my-account.facade';
import { Outcome } from '../../../core/facades/outcome';
import { TitleCopiesFacade } from '../../../core/facades/title-copies.facade';
import { TitleSearchFacade } from '../../../core/facades/title-search.facade';
import { CopyAction } from '../../../core/models';
import { EmptyStateComponent, ErrorBannerComponent, FlashComponent, LoadingComponent } from '../../../shared/components';
import { SearchFilters, SearchFormComponent } from '../presentation/search-form.component';
import { TitleResultsComponent } from '../presentation/title-results.component';

@Component({
  selector: 'app-search-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchFormComponent, TitleResultsComponent, LoadingComponent, ErrorBannerComponent, EmptyStateComponent, FlashComponent],
  template: `
    <h1>Catalog</h1>
    <app-search-form [busy]="search.isLoading()" [genres]="genre.genres()" (search)="onSearch($event)" />
    @if (outcome(); as o) {
      <app-flash [outcome]="o" (dismiss)="outcome.set(null)" />
    }
    @if (search.error(); as message) {
      <app-error-banner [message]="message" />
    } @else if (search.page(); as page) {
      @if (page.totalCount === 0) {
        <app-empty-state message="No title matches this search." />
      } @else {
        <app-title-results
          [page]="page"
          [pageCount]="search.pageCount()"
          [canBorrow]="session.isPatron()"
          [canManage]="session.isLibrarian()"
          [busyId]="busyId()"
          [genres]="genre.genres()"
          [openCopies]="copies.titleId()"
          [copies]="copies.copies()"
          [copiesError]="copies.error()"
          (toggleCopies)="copies.toggle($event)"
          (copyAction)="run($event.title.titleId, copyAction($event.action))"
          (borrow)="run($event, account.checkOut($event))"
          (hold)="run($event, account.placeHold($event))"
          (goTo)="search.goToPage($event)"
          (edit)="run($event.title.titleId, admin.update($event.title.titleId, $event.draft))"
          (addCopy)="run($event.title.titleId, admin.addCopy($event.title.titleId, $event.title.title, $event.barcode, $event.condition))"
          (remove)="run($event.titleId, admin.remove($event.titleId, $event.title))"
        />
      }
    } @else {
      <app-loading />
    }
  `,
})
export class SearchContainerComponent {
  protected readonly search = inject(TitleSearchFacade);
  protected readonly account = inject(MyAccountFacade);
  protected readonly admin = inject(CatalogAdminFacade);
  protected readonly session = inject(Session);
  protected readonly genre = inject(GenreFacade);
  protected readonly copies = inject(TitleCopiesFacade);
  private readonly desk = inject(DeskFacade);

  protected readonly outcome = signal<Outcome | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected onSearch(filters: SearchFilters): void {
    this.outcome.set(null);
    this.search.search(filters);
  }

  private copyAction(action: CopyAction): Promise<Outcome> {
    switch (action.kind) {
      case 'condition': return this.desk.changeCondition(action.barcode, action.condition);
      case 'maintenance': return this.desk.sendToMaintenance(action.barcode);
      case 'backInService': return this.desk.endMaintenance(action.barcode);
      case 'found': return this.desk.markFound(action.barcode);
    }
  }

  // Borrowing, a hold or a copy change moves the copies free (P8), so a success reloads the page shown.
  protected async run(titleId: string, action: Promise<Outcome>): Promise<void> {
    this.busyId.set(titleId);
    const outcome = await action;
    this.outcome.set(outcome);
    if (outcome.ok) this.search.reload();
    this.busyId.set(null);
  }
}
