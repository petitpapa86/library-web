import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { toApiError } from '../http/api-error';
import { PatronAdminService } from '../services/patron-admin.service';

// L0f — patrons found by part of their name or email. Nothing loads until the desk searches.
@Injectable({ providedIn: 'root' })
export class PatronSearchFacade {
  private readonly service = inject(PatronAdminService);

  private readonly _query = signal<{ q: string; page: number } | null>(null);
  private readonly _results = resource({
    params: () => this._query() ?? undefined,
    loader: ({ params }) => this.service.search(params.q, params.page),
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

  search(q: string): void {
    this._query.set({ q: q.trim(), page: 1 });
  }

  goToPage(page: number): void {
    this._query.update(query => (query ? { ...query, page } : query));
  }

  // A patron's name, email or closure changed at the desk: the list shows it.
  reload(): void {
    if (this._query()) this._results.reload();
  }
}
