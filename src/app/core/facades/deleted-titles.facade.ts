import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { Session } from '../auth/session';
import { toApiError } from '../http/api-error';
import { TitleSearchQuery } from '../models';
import { TitleService } from '../services/title.service';

// L1e — deleted titles, to restore one (L1d). Librarian only; starts by listing them all, newest search on page 1.
@Injectable({ providedIn: 'root' })
export class DeletedTitlesFacade {
  private readonly service = inject(TitleService);
  private readonly session = inject(Session);

  private readonly _query = signal<TitleSearchQuery>({ page: 1 });
  private readonly _results = resource({
    params: () => (this.session.isLibrarian() ? this._query() : undefined),
    loader: ({ params }) => this.service.searchDeleted(params),
  });

  readonly page = computed(() => (this._results.hasValue() ? this._results.value() : null));
  readonly isLoading = computed(() => this._results.isLoading());
  readonly error = computed(() => {
    const err = this._results.error();
    return err ? toApiError(err.cause ?? err).message : null;
  });
  readonly pageCount = computed(() => {
    const page = this.page();
    return page ? Math.max(1, Math.ceil(page.totalCount / page.pageSize)) : 1;
  });

  search(filters: Omit<TitleSearchQuery, 'page'>): void {
    this._query.set({ ...filters, page: 1 });
  }

  goToPage(page: number): void {
    this._query.update(q => ({ ...q, page }));
  }

  reload(): void {
    this._results.reload();
  }
}
