import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { toApiError } from '../http/api-error';
import { PatronAdminService } from '../services/patron-admin.service';

// L0e — the patron looked up at the desk. Patron and fines changes reload it, so it always shows what the API has.
@Injectable({ providedIn: 'root' })
export class PatronLookupFacade {
  private readonly service = inject(PatronAdminService);

  private readonly _memberId = signal<string | null>(null);
  private readonly _view = resource({
    params: () => this._memberId() ?? undefined,
    loader: ({ params }) => this.service.lookup(params),
  });

  readonly memberId = this._memberId.asReadonly();
  readonly view = computed(() => (this._view.hasValue() ? this._view.value() : null));
  readonly isLoading = computed(() => this._view.isLoading());
  readonly error = computed(() => {
    const err = this._view.error();
    return err ? toApiError(err.cause ?? err).message : null;
  });

  lookUp(memberId: string): void {
    const id = memberId.trim().toUpperCase();
    if (id === this._memberId()) this._view.reload();
    else this._memberId.set(id);
  }

  clear(): void {
    this._memberId.set(null);
  }

  reload(): void {
    if (this._memberId()) this._view.reload();
  }
}
