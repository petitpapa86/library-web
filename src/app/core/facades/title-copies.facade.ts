import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { toApiError } from '../http/api-error';
import { TitleService } from '../services/title.service';

// L2d — the copies of the one title open in the catalog. A copy or title change at the desk reloads it.
@Injectable({ providedIn: 'root' })
export class TitleCopiesFacade {
  private readonly service = inject(TitleService);

  private readonly _titleId = signal<string | null>(null);
  private readonly _copies = resource({
    params: () => this._titleId() ?? undefined,
    loader: ({ params }) => this.service.copies(params),
  });

  readonly titleId = this._titleId.asReadonly();
  readonly copies = computed(() => (this._copies.hasValue() ? this._copies.value() : null));
  readonly isLoading = computed(() => this._copies.isLoading());
  readonly error = computed(() => {
    const err = this._copies.error();
    return err ? toApiError(err.cause ?? err).message : null;
  });

  // Opens this title's copies, or closes them when they are already open.
  toggle(titleId: string): void {
    this._titleId.update(open => (open === titleId ? null : titleId));
  }

  reload(): void {
    if (this._titleId()) this._copies.reload();
  }
}
