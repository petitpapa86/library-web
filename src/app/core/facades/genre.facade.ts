import { Injectable, computed, inject, resource } from '@angular/core';
import { Session } from '../auth/session';
import { TitleService } from '../services/title.service';

// L2d — the library's configured genres, loaded once someone is signed in: P1 filters by them, L1a/L1b pick from them.
@Injectable({ providedIn: 'root' })
export class GenreFacade {
  private readonly service = inject(TitleService);
  private readonly session = inject(Session);

  private readonly _genres = resource({
    params: () => (this.session.isSignedIn() ? true : undefined),
    loader: () => this.service.genres(),
  });

  readonly genres = computed<readonly string[]>(() => (this._genres.hasValue() ? this._genres.value() : []));
}
