import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Session } from '../../../core/auth/session';
import { MyAccountFacade } from '../../../core/facades/my-account.facade';
import { Outcome } from '../../../core/facades/outcome';
import { TitleSearchFacade } from '../../../core/facades/title-search.facade';
import { EmptyStateComponent, ErrorBannerComponent, FlashComponent, LoadingComponent } from '../../../shared/components';
import { SearchFilters, SearchFormComponent } from '../presentation/search-form.component';
import { TitleResultsComponent } from '../presentation/title-results.component';

@Component({
  selector: 'app-search-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchFormComponent, TitleResultsComponent, LoadingComponent, ErrorBannerComponent, EmptyStateComponent, FlashComponent],
  template: `
    <h1>Catalog</h1>
    <app-search-form [busy]="search.isLoading()" (search)="onSearch($event)" />
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
          [busyId]="busyId()"
          (borrow)="run($event, account.checkOut($event))"
          (hold)="run($event, account.placeHold($event))"
          (goTo)="search.goToPage($event)"
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
  protected readonly session = inject(Session);

  protected readonly outcome = signal<Outcome | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected onSearch(filters: SearchFilters): void {
    this.outcome.set(null);
    this.search.search(filters);
  }

  protected async run(titleId: string, action: Promise<Outcome>): Promise<void> {
    this.busyId.set(titleId);
    this.outcome.set(await action);
    this.busyId.set(null);
  }
}
