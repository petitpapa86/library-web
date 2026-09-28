import { Injectable, computed, inject, resource } from '@angular/core';
import { Session } from '../auth/session';
import { toApiError } from '../http/api-error';
import { MyAccountService } from '../services/my-account.service';

// The signed-in patron's notices (R-09: P3 hold ready, P7 due soon and overdue). Loads only for a patron; the unread
// count shows beside "My account".
@Injectable({ providedIn: 'root' })
export class NoticesFacade {
  private readonly service = inject(MyAccountService);
  private readonly session = inject(Session);

  private readonly _notices = resource({
    params: () => (this.session.isPatron() ? true : undefined),
    loader: () => this.service.notices(),
  });

  readonly notices = computed(() => (this._notices.hasValue() ? this._notices.value() : []));
  readonly unread = computed(() => this.notices().filter(n => n.readAt === null).length);
  readonly error = computed(() => {
    const err = this._notices.error();
    return err ? toApiError(err.cause ?? err).message : null;
  });

  reload(): void {
    this._notices.reload();
  }

  // A failure leaves the notice unread; the next reload shows it as it is.
  async markRead(noticeId: string): Promise<void> {
    try {
      await this.service.markRead(noticeId);
    } finally {
      this._notices.reload();
    }
  }
}
