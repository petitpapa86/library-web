import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { toApiError } from '../http/api-error';
import { TitleSearchQuery } from '../models';
import { TitleService } from '../services/title.service';

// P1 — the catalog search. Starts by browsing the whole catalog; a new search goes back to page 1.
@Injectable({ providedIn: 'root' })
export class TitleSearchFacade {
  private readonly service = inject(TitleService);

  private readonly _query = signal<TitleSearchQuery>({ page: 1 });
  private readonly _results = resource({
    params: () => this._query(),
    loader: ({ params }) => this.service.search(params),
  });

  readonly query = this._query.asReadonly();
  readonly page = computed(() => this._results.value() ?? null);
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
}
